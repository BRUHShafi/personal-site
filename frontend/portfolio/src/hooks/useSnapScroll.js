import { useEffect } from 'react'

// How long one section-to-section glide takes. This is the knob CSS never gave
// us — there is no `scroll-snap-duration`, the native glide is browser-internal.
// Slow on purpose. A panel can ask for a longer glide into/out of it with
// data-glide-ms="..." — the hero does (2400), so its sword-slices-the-name
// animation has time to read.
const DURATION = 1800

// Trackpads keep firing wheel events well after the flick. Ignore them briefly
// after a glide lands, otherwise inertia carries you straight into the next one.
const COOLDOWN = 140

// Sine rather than cubic: cubic spends most of its time at the ends and races
// through the middle — exactly where scroll-linked animations play — so even a
// long glide felt rushed.
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// Takes the wheel over and animates the *real* document scroll to the next
// panel. Native scroll position still advances, so every scrollY-driven effect
// on the page — the swords, the lightning, the navbar dim check — keeps working.
//
// Only the wheel is hijacked. Keyboard, touch, and scrollbar dragging fall
// through to the CSS snap underneath, which is why that CSS stays in place.
export function useSnapScroll() {
  useEffect(() => {
    // Touch devices get native snap; hijacking touch scroll feels awful.
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!finePointer || reduced) return

    const root = document.documentElement
    let animating = false
    let rafId = null
    let lockedUntil = 0

    // Recomputed per wheel event rather than cached — panels move when the
    // window resizes, and this keeps us honest about where the stops actually are.
    const scrollStops = () => {
      const max = root.scrollHeight - window.innerHeight
      const panels = [...document.querySelectorAll('.snap-panel')]
      const tops = panels.map((p) => Math.min(p.offsetTop, max))
      const durations = panels.map((p) => Number(p.dataset.glideMs) || DURATION)
      // The footer isn't a panel, but the bottom of the page is still a stop.
      if (tops.length && max - tops[tops.length - 1] > 8) {
        tops.push(max)
        durations.push(DURATION)
      }
      return { tops, durations }
    }

    const animateTo = (target, duration) => {
      const start = window.scrollY
      const delta = target - start
      if (Math.abs(delta) < 1) return

      animating = true
      // CSS snap would fight our per-frame scrollTo calls. Stand it down.
      root.classList.add('snapping')

      const t0 = performance.now()
      const step = (now) => {
        const t = Math.min(1, (now - t0) / duration)
        window.scrollTo(0, start + delta * easeInOutSine(t))

        if (t < 1) {
          rafId = requestAnimationFrame(step)
        } else {
          animating = false
          root.classList.remove('snapping')
          lockedUntil = performance.now() + COOLDOWN
        }
      }
      rafId = requestAnimationFrame(step)
    }

    const onWheel = (e) => {
      // Always swallow the event, even mid-glide — otherwise the browser
      // scrolls underneath us and the animation stutters.
      e.preventDefault()
      if (animating || performance.now() < lockedUntil) return

      const dir = Math.sign(e.deltaY)
      if (!dir) return

      const { tops, durations } = scrollStops()
      if (!tops.length) return

      // Derive the current stop from scrollY instead of tracking an index.
      // Navbar clicks and keyboard scrolling move us without telling us.
      let nearest = 0
      let best = Infinity
      tops.forEach((top, i) => {
        const d = Math.abs(top - window.scrollY)
        if (d < best) { best = d; nearest = i }
      })

      const next = Math.min(tops.length - 1, Math.max(0, nearest + dir))
      // The slower of the two panels sets the pace, so the hero glide is long
      // in both directions
      if (next !== nearest) animateTo(tops[next], Math.max(durations[nearest], durations[next]))
    }

    // Must be non-passive — a passive listener can't call preventDefault.
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      cancelAnimationFrame(rafId)
      root.classList.remove('snapping')
    }
  }, [])
}
