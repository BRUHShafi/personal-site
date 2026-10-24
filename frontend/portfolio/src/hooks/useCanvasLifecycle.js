import { useEffect, useState } from 'react'

// On/off for a WebGL canvas:
//
//   `mounted`  — true once the page has finished loading and the browser is
//                idle, then stays true. All sword canvases are built up front
//                and never torn down while the page is open.
//   `onScreen` — whether the wrapper is in the viewport. Callers combine it
//                with their own "is the sword actually in frame" check to set
//                frameloop, so off-screen canvases are paused (zero per-frame
//                cost) and resume instantly.
//
// Why not unmount off-screen canvases to free the GPU? Tried it. Rebuilding a
// canvas (new WebGL context + shader compile) is a 40–90ms blocking task, and
// with continuous scrolling there's no quiet moment to hide it in — swords
// popped in late and scrolling back up stuttered. With only three canvases,
// keeping them alive (~20MB GPU each) is the better trade. Pausing is free to
// undo; rebuilding isn't.
export default function useCanvasLifecycle(ref) {
  const [mounted, setMounted]   = useState(false)
  const [onScreen, setOnScreen] = useState(false)

  // Build after load, in idle time, so it never competes with first paint or
  // with the user's first scroll. Falls back to a timeout (Safari has no
  // requestIdleCallback).
  useEffect(() => {
    let cancel
    const build = () => {
      if (window.requestIdleCallback) {
        const id = window.requestIdleCallback(() => setMounted(true), { timeout: 1500 })
        cancel = () => window.cancelIdleCallback(id)
      } else {
        const id = setTimeout(() => setMounted(true), 200)
        cancel = () => clearTimeout(id)
      }
    }
    if (document.readyState === 'complete') build()
    else window.addEventListener('load', build, { once: true })
    return () => {
      window.removeEventListener('load', build)
      cancel?.()
    }
  }, [])

  // The loading intro covers the whole page; until it uncovers, nothing here
  // is visible, so canvases stay paused (IntroReveal sets the class)
  const [covered, setCovered] = useState(
    () => document.documentElement.classList.contains('intro-covering'),
  )
  useEffect(() => {
    const html = document.documentElement
    const obs = new MutationObserver(() => setCovered(html.classList.contains('intro-covering')))
    obs.observe(html, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting)
        // Safety net: if it's visible before the idle build fired, build now
        if (entry.isIntersecting) setMounted(true)
      },
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])

  return { mounted, onScreen: onScreen && !covered }
}
