import { useLayoutEffect, useRef, useState } from 'react'
import { HAND_FINGERTIP, decodeHandParticles } from '../data/handParticles'
import './IntroReveal.css'

// The loading intro. The page opens on darkness with only the SHAFI blackhole
// (the navbar's centre orb, which sits above this overlay).
//
//   1. Gold stardust drifts in from space and slowly gathers into a hand
//      reaching for the blackhole. The blackhole wakes as it nears.
//   2. The hand stops just short, pointing at it, and waits. Dust peels off
//      the fingertip and spirals in; "Click the blackhole to continue" fades
//      in. This teaches visitors the orb is clickable — it's the site's menu.
//   3. Click (or Enter): the fingertip touches, the blackhole swallows
//      everything — hand, dust and all — collapses to a point, holds a beat…
//   4. …and goes supernova: flash, light rays, three shockwave rings and a
//      ragged, ember-shedding wavefront that tears the dark open.
//
// Plays only on a fresh load / refresh of the home page while at the top —
// not when coming back from /interests or /projects, and not when refreshing
// halfway down the page. prefers-reduced-motion: no hand or burst; the hint
// shows straight away and the click fades the dark out.

// ── Before the click (seconds since load) ──
const T_FORM      = 0.5    // first dust starts gathering into the hand
const FORM_SPREAD = 2.0    // wrist-to-fingertip stagger of the gathering
const FORM_DUR    = 1.5    // how long each mote takes to arrive
const T_WAKE      = 1.2    // blackhole starts waking
const T_NEAR      = 4.5    // hand arrives just short of the blackhole
const T_HINT      = 4.9    // "click to continue" fades in
const T_CLICKABLE = 3.8    // clicks before this are ignored (hand not there yet)

// ── After the click (seconds since the click) ──
const REACH   = 0.5        // fingertip closes the last gap → touch
// Absorption: the hand is swallowed fingertip → wrist → arm. Each mote's turn
// comes ABSORB_STAGGER later the further up the arm it is; once its turn
// comes it takes FALL seconds to spiral in.
const ABSORB_STAGGER = 1.5
const FALL    = 1.1
const ABSORB  = 2.9        // from the touch until the last mote is gone
const BEAT    = 0.55       // collapsed to a point, holding its breath
const NOVA    = 3.0        // supernova: the dark tears open
const U_NOVA  = REACH + ABSORB + BEAT

const NEAR_GAP  = 22       // px the fingertip hovers short of the orb
const HOVER_BOB = 5        // px the waiting hand drifts in and out
const ARM_ANGLE = 18       // degrees the arm slopes down to the right
const REDUCED_FADE = 0.6   // seconds, reduced-motion fade

// Settling before the hand appears (see `start` below): wait for the page to
// load and the browser to report idle time, but never longer than this
const SETTLE_MAX_MS = 2500

// Hand size: fingertip-to-wrist ≈ 268 hand units. Fit it to ~32% of the
// width, but never taller than ~45% of the screen.
const HAND_SPAN = 268
const HAND_TALL = 160

const ACCRETION    = 240   // dust motes circling the blackhole
const STREAM_REACH = 95    // hand units from the fingertip that can peel off
const STREAM_SHARE = 0.4   // fraction of those that do
const STREAM_CYCLE = 2.6   // seconds per peel → spiral in → re-form loop
const RAYS   = 30          // supernova light rays
const RINGS  = 3           // supernova shockwave rings
const EMBERS = 900         // ember pool shed by the wavefront

const DARK = '#04040a'
const SCROLL_KEY = 'intro:lastScrollY'
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'])

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const ramp = (t, a, b) => clamp01((t - a) / (b - a))
const easeOutCubic   = (t) => 1 - Math.pow(1 - t, 3)
const easeOutQuart   = (t) => 1 - Math.pow(1 - t, 4)
const easeInCubic    = (t) => t * t * t
const easeInOutSine  = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// Remember where the home page was when it was left, so a refresh halfway
// down (the browser restores that position) skips the intro
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    try {
      sessionStorage.setItem(SCROLL_KEY, location.pathname === '/' ? String(window.scrollY) : '0')
    } catch { /* storage blocked — the intro just plays */ }
  })
}

// Decided once per page load. Flipped off when the intro finishes, so SPA
// navigation back to the home page doesn't replay it.
let pending = (() => {
  if (typeof window === 'undefined' || location.hash) return false
  try {
    if (Number(sessionStorage.getItem(SCROLL_KEY)) > 10) return false
  } catch { /* storage blocked */ }
  return true
})()

// Seeded PRNG so the dust lands the same way every time
function mulberry32(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Soft round glow, drawn once and stamped for every mote
function makeSprite() {
  const c = document.createElement('canvas')
  c.width = c.height = 32
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  grad.addColorStop(0,    'rgba(255, 246, 220, 1)')
  grad.addColorStop(0.25, 'rgba(255, 205, 90, 0.85)')
  grad.addColorStop(1,    'rgba(255, 150, 20, 0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 32, 32)
  return c
}

// Per-mote animation data for the hand + the blackhole's dust + the nova
function buildDust() {
  const P = decodeHandParticles()
  const rand = mulberry32(11)
  const { n, x } = P
  const sx = new Float32Array(n)     // where each mote starts (offset, px)
  const sy = new Float32Array(n)
  const delay = new Float32Array(n)  // gathering stagger, wrist → fingertip
  const phase = new Float32Array(n)  // twinkle + implosion spin variety
  const peel = new Float32Array(n)   // ≥0: offset into the fingertip stream loop
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2
    const r = 220 + rand() * 640
    sx[i] = Math.cos(a) * r
    sy[i] = Math.sin(a) * r
    // fingertip (small x) gathers last; a little randomness so it shimmers in
    delay[i] = clamp01(1 - (x[i] - 70) / 520) * 0.8 + rand() * 0.2
    phase[i] = rand() * Math.PI * 2
    const nearTip = x[i] - HAND_FINGERTIP.x < STREAM_REACH
    peel[i] = nearTip && rand() < STREAM_SHARE ? rand() * STREAM_CYCLE : -1
  }

  // Motes circling the blackhole
  const acc = Array.from({ length: ACCRETION }, () => ({
    r: 1.3 + rand() * 3.2,          // × orb radius
    a: rand() * Math.PI * 2,
    speed: 0.6 + rand() * 0.8,
    size: 0.5 + rand() * 1.2,
    tilt: 0.35 + rand() * 0.25,     // squashed into a disk, like the eclipse
  }))

  const rays = Array.from({ length: RAYS }, (_, i) => ({
    a: (i / RAYS) * Math.PI * 2 + (rand() - 0.5) * 0.25,
    len: 0.45 + rand() * 0.75,      // × screen reach
    width: 0.012 + rand() * 0.03,   // radians
    delay: rand() * 0.3,
  }))

  // Ember pool, reused (no allocation per frame)
  const emb = {
    x: new Float32Array(EMBERS), y: new Float32Array(EMBERS),
    vx: new Float32Array(EMBERS), vy: new Float32Array(EMBERS),
    life: new Float32Array(EMBERS), max: new Float32Array(EMBERS),
    size: new Float32Array(EMBERS), next: 0,
  }

  return { ...P, sx, sy, delay, phase, peel, acc, rays, emb, rand }
}

// A mote falling into the blackhole, at progress k (0 → 1): its distance
// shrinks slowly then plunges, it swings round, and tips into the disk's plane.
// Writes x, y into out[o], out[o + 1].
function fallTo(out, o, O, r0, th0, spin, k) {
  const r = r0 * (1 - k * k)
  const th = th0 + spin * Math.pow(k, 1.5)
  const flat = 1 - 0.55 * easeInOutSine(k)
  out[o] = O.x + Math.cos(th) * r
  out[o + 1] = O.y + Math.sin(th) * r * flat
}

// ── Frame-rate meter (development only) ──
// Open the site with ?introfps on the dev server: after the reveal, a panel
// shows the real frame times per phase. Must be a focused window — background
// tabs are throttled.
const METER = import.meta.env.DEV && typeof location !== 'undefined' && location.search.includes('introfps')

function makeMeter() {
  const phases = { waiting: [], touch: [], absorb: [], collapse: [], nova: [] }
  let last = 0
  return {
    record(now, u) {
      if (last) {
        const name = u === 'waiting' ? 'waiting'
          : u < REACH ? 'touch'
          : u < REACH + ABSORB ? 'absorb'
          : u < U_NOVA ? 'collapse' : 'nova'
        phases[name].push(now - last)
      }
      last = now
    },
    report() {
      const rows = Object.entries(phases).filter(([, v]) => v.length).map(([name, v]) => {
        const s = [...v].sort((a, b) => a - b)
        const avg = v.reduce((a, b) => a + b, 0) / v.length
        return `${name.padEnd(9)} ${String(Math.round(1000 / avg)).padStart(3)} fps   worst ${s[s.length - 1].toFixed(0).padStart(3)}ms   frames >20ms: ${v.filter((x) => x > 20).length}`
      })
      const el = document.createElement('pre')
      el.textContent = 'Intro frame times (click to close)\n\n' + rows.join('\n')
      el.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:9999;margin:0;padding:14px 16px;background:#000c;color:#ffd98a;font:12px/1.6 monospace;border:1px solid #ffc73866;border-radius:8px;cursor:pointer'
      el.onclick = () => el.remove()
      document.body.appendChild(el)
    },
  }
}

// Ragged wavefront radius at angle `a` — a few octaves of moving wobble so the
// dark tears open rather than opening as a perfect circle
const ragged = (r, a, n, t) =>
  r * (1 + 0.07 * Math.sin(5 * a + 3 * n) + 0.045 * Math.sin(11 * a - 5 * n + 1.3) + 0.025 * Math.sin(23 * a + 9 * t))

export default function IntroReveal() {
  const [playing, setPlaying] = useState(() => pending)
  const rootRef   = useRef()
  const canvasRef = useRef()
  const hintRef   = useRef()

  useLayoutEffect(() => {
    if (!playing) return
    const html = document.documentElement
    html.classList.add('intro-playing')
    // While the dark fully covers the page, the 3D canvases underneath pause
    // (useCanvasLifecycle watches this class) — they'd be rendering for nobody
    // and competing with the intro for the GPU
    html.classList.add('intro-covering')
    window.scrollTo(0, 0)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // The clock only starts once the page has settled. The first second of a
    // load is React rendering the site + the 3D canvases being built — frames
    // of 100–200ms that made the hand stutter as it gathered. Until then the
    // screen is just the blackhole in the dark.
    // "Settled" = the page has loaded and the browser has idle time to spare
    // (requestIdleCallback) — a signal that doesn't depend on refresh rate.
    let start = reduced ? performance.now() : null
    const mountedAt = performance.now()
    let settled = false
    let idleId = 0
    const onSettled = () => { settled = true }
    const waitIdle = () => {
      if (window.requestIdleCallback) idleId = window.requestIdleCallback(onSettled, { timeout: SETTLE_MAX_MS })
      else idleId = setTimeout(onSettled, 300)     // Safari: no requestIdleCallback
    }
    if (document.readyState === 'complete') waitIdle()
    else window.addEventListener('load', waitIdle, { once: true })
    let raf = 0
    let clickedAt = null       // timeline seconds of the click, once it happens
    let dAtClick = NEAR_GAP    // hand distance when clicked (final reach starts here)
    let lastNow = mountedAt
    let geo = null
    let orbHover = 0           // eased 0..1 while the pointer is on the orb

    const orbEl = () => document.querySelector('.orbital-nav__center')
    const hint = hintRef.current

    const finish = () => {
      meter?.report()
      unblock()
      html.classList.remove('intro-playing', 'intro-covering')
      pending = false
      setPlaying(false)
    }

    // ── Click to continue ──
    // Capture on window runs before React's handler on the orb, so the click
    // that wakes the site doesn't also open the navbar menu.
    const elapsed = () => (start === null ? 0 : (performance.now() - start) / 1000)
    const go = () => {
      if (clickedAt !== null) return
      if (!reduced && elapsed() < T_CLICKABLE) return
      clickedAt = elapsed()
      dAtClick = geo ? geo.dNow : NEAR_GAP
      hint.classList.add('intro__hint--gone')
    }
    const nudge = () => {
      hint.classList.remove('intro__hint--nudge')
      void hint.offsetWidth              // restart the shake animation
      hint.classList.add('intro__hint--nudge')
    }
    const onClick = (e) => {
      if (clickedAt !== null) return
      const orb = orbEl()
      const onOrb = !orb || orb.contains(e.target)
      e.preventDefault()
      e.stopPropagation()
      if (onOrb) go()
      else nudge()
    }
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        go()
      } else if (SCROLL_KEYS.has(e.key)) {
        e.preventDefault()
      }
    }
    // No scrolling while it plays: block the inputs, and put the page back if
    // anything else (e.g. dragging the invisible scrollbar) moves it
    const block = (e) => e.preventDefault()
    const pin = () => { if (window.scrollY !== 0) window.scrollTo(0, 0) }
    window.addEventListener('wheel', block, { passive: false })
    window.addEventListener('touchmove', block, { passive: false })
    window.addEventListener('scroll', pin, { passive: true })
    const unblock = () => {
      window.removeEventListener('wheel', block)
      window.removeEventListener('touchmove', block)
      window.removeEventListener('scroll', pin)
    }
    const onMove = (e) => {
      const orb = orbEl()
      if (geo) geo.overOrb = !!orb && orb.contains(e.target)
    }

    // ── Reduced motion: hint at once, click fades the dark away ──
    if (reduced) {
      hint.classList.add('intro__hint--shown')
      const c = canvasRef.current
      c.width = window.innerWidth
      c.height = window.innerHeight
      const g = c.getContext('2d')
      g.fillStyle = DARK
      g.fillRect(0, 0, c.width, c.height)
      const fade = (now) => {
        if (clickedAt !== null) {
          const u = (now - start) / 1000 - clickedAt
          rootRef.current.style.opacity = String(1 - ramp(u, 0, REDUCED_FADE))
          if (u >= REDUCED_FADE) return finish()
        }
        raf = requestAnimationFrame(fade)
      }
      window.addEventListener('click', onClick, true)
      window.addEventListener('keydown', onKey, true)
      raf = requestAnimationFrame(fade)
      return () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('click', onClick, true)
        window.removeEventListener('keydown', onKey, true)
        unblock()
        html.classList.remove('intro-playing', 'intro-covering')
      }
    }

    const meter = METER ? makeMeter() : null
    const dust = buildDust()
    const sprite = makeSprite()
    const streaks = [[], [], []]   // per-frame streak segments, reused
    const fall = new Float32Array(4) // scratch: a falling mote's tail + head
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Where the orb is, how big the hand is, where it must end up
    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
      canvas.width = Math.round(vw * dpr)
      canvas.height = Math.round(vh * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const r = orbEl()?.getBoundingClientRect()
      const O = r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: vw / 2, y: 70 }
      const R = r && r.width ? r.width / 2 : 30
      const a = (ARM_ANGLE * Math.PI) / 180
      geo = {
        overOrb: false,
        dNow: NEAR_GAP,
        ...geo,
        vw, vh, O, R,
        s: Math.min((vw * 0.32) / HAND_SPAN, (vh * 0.45) / HAND_TALL),
        cos: Math.cos(a), sin: Math.sin(a),
        // The touch point: the orb's rim, on the side the arm comes from
        T: { x: O.x + R * Math.cos(a), y: O.y + R * Math.sin(a) },
        away: vw * 0.55,     // how far back along the arm the hand starts
        maxR: Math.hypot(Math.max(O.x, vw - O.x), Math.max(O.y, vh - O.y)) * 1.15,
      }
    }

    const drawMote = (x, y, size, alpha) => {
      if (alpha <= 0.01) return
      ctx.globalAlpha = alpha > 1 ? 1 : alpha
      ctx.drawImage(sprite, x - size, y - size, size * 2, size * 2)
    }

    const glow = (x, y, r0, r1, stops) => {
      const g = ctx.createRadialGradient(x, y, r0, x, y, r1)
      for (const [o, c] of stops) g.addColorStop(o, c)
      ctx.globalAlpha = 1
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r1, 0, Math.PI * 2)
      ctx.fill()
    }

    const frame = (now) => {
      if (meter) meter.record(now, clickedAt === null ? 'waiting' : (now - start) / 1000 - clickedAt)
      // Scroll snapping can re-snap after pin() — hold the top every frame too
      pin()
      const dt = Math.min(0.05, (now - lastNow) / 1000)
      if (start === null) {
        if (settled || now - mountedAt > SETTLE_MAX_MS) {
          start = now
          rootRef.current.dataset.started = String(Math.round(now))
        }
      }
      lastNow = now
      const t = start === null ? 0 : (now - start) / 1000
      const { vw, vh, O, R, s, cos, sin, T, away, maxR } = geo
      const u = clickedAt === null ? -1 : t - clickedAt        // time since click
      // feed: 0 → 1 across the absorption; crush: the blackhole collapsing to a
      // point once it has swallowed everything
      const feed = u < 0 ? 0 : ramp(u, REACH, REACH + ABSORB)
      const crush = u < 0 ? 0 : easeInCubic(ramp(u, REACH + ABSORB - 0.4, REACH + ABSORB + 0.15))
      const nova = u < 0 ? 0 : ramp(u, U_NOVA, U_NOVA + NOVA)
      const novaOn = u >= U_NOVA
      if (novaOn) html.classList.remove('intro-covering')   // site about to show
      orbHover += ((geo.overOrb && clickedAt === null ? 1 : 0) - orbHover) * Math.min(1, dt * 8)

      // ── The dark curtain (drawn here so its edge can tear) ──
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, vw, vh)
      ctx.fillStyle = DARK
      ctx.fillRect(0, 0, vw, vh)
      let holeR = 0
      if (novaOn) {
        holeR = easeOutQuart(nova) * maxR
        ctx.globalCompositeOperation = 'destination-out'
        ctx.beginPath()
        const STEPS = 120
        for (let k = 0; k <= STEPS; k++) {
          const a = (k / STEPS) * Math.PI * 2
          const rr = ragged(holeR, a, nova, t)
          const x = O.x + Math.cos(a) * rr
          const y = O.y + Math.sin(a) * rr
          if (k) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
        // Soft edge: two wide, faint strokes along the torn edge itself. (A
        // radial-gradient disc did the same but filled the whole screen.)
        ctx.strokeStyle = '#000'
        ctx.globalAlpha = 0.35
        ctx.lineWidth = 110
        ctx.stroke()
        ctx.globalAlpha = 0.5
        ctx.lineWidth = 45
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      ctx.globalCompositeOperation = 'lighter'

      // How awake the blackhole is (0 → 1 as the hand nears); a slow pulse
      // while it waits; brighter when hovered
      const wake = easeInOutSine(ramp(t, T_WAKE, T_NEAR))
      const waiting = clickedAt === null ? ramp(t, T_NEAR, T_NEAR + 0.8) : 0
      const pulse = waiting * (0.5 + 0.5 * Math.sin((t - T_NEAR) * 2.2))

      // ── Blackhole glow: swells, pulses while waiting, swells more as it
      //    feeds on the hand, then crushes to a bright point ──
      if (!novaOn || nova < 0.25) {
        const shrink = 1 - 0.75 * crush
        const feeding = Math.sin(Math.PI * feed) * (0.85 + 0.15 * Math.sin(u * 9))
        const glowR = R * (1.6 + 3.4 * wake + 0.8 * pulse + 1.2 * orbHover + 1.6 * feeding) * shrink
        const glowA = (0.15 + 0.55 * wake + 0.15 * pulse + 0.25 * orbHover + 0.35 * feeding + 0.6 * crush) * (1 - ramp(nova, 0, 0.25))
        glow(O.x, O.y, R * 0.8 * shrink, glowR, [
          [0, `rgba(255, 175, 50, ${glowA})`],
          [0.4, `rgba(255, 110, 10, ${glowA * 0.45})`],
          [1, 'rgba(255, 80, 0, 0)'],
        ])
      }
      // The held breath: a white-hot pinpoint
      if (u >= REACH && !novaOn) {
        const b = ramp(u, REACH + ABSORB - 0.3, U_NOVA)
        glow(O.x, O.y, 0, R * (0.9 + 0.5 * Math.sin(u * 40) * b), [
          [0, `rgba(255, 252, 240, ${0.9 * b})`],
          [1, 'rgba(255, 200, 120, 0)'],
        ])
      }

      // ── Dust circling the blackhole ──
      if (!novaOn) {
        for (const m of dust.acc) {
          // Spins faster and tighter as it feeds, then collapses with the crush
          const ang = m.a + t * m.speed * (1.4 / m.r) * (1 + 1.5 * feed + 3 * crush)
          const rr = R * m.r * (1 - 0.15 * wake) * (1 - 0.3 * feed) * (1 - crush)
          drawMote(
            O.x + Math.cos(ang) * rr,
            O.y + Math.sin(ang) * rr * m.tilt,
            2.2 * m.size,
            wake * 0.75 * (1 + 0.6 * feed) * (1 - ramp(crush, 0.8, 1)),
          )
        }
      }

      // ── The hand ──
      // d = px still to travel along the arm; 0 = fingertip on the orb
      let d
      if (clickedAt !== null) {
        d = dAtClick * (1 - easeInCubic(ramp(u, 0, REACH)))
      } else if (t < T_NEAR) {
        d = NEAR_GAP + (away - NEAR_GAP) * (1 - easeOutCubic(ramp(t, T_FORM, T_NEAR)))
      } else {
        d = NEAR_GAP + HOVER_BOB * Math.sin((t - T_NEAR) * 1.6) * waiting
      }
      geo.dNow = d
      const bx = T.x + d * cos
      const by = T.y + d * sin

      if (!novaOn) {
        const { n, x: ux, y: uy, b, sx, sy, delay, phase, peel } = dust
        // Streak style for motes falling into the blackhole
        ctx.strokeStyle = 'rgb(255, 214, 140)'
        ctx.lineWidth = 1.3
        ctx.lineCap = 'round'
        for (let i = 0; i < n; i++) {
          // Hand-space → screen: scale, rotate by the arm angle, place
          const hx = (ux[i] - HAND_FINGERTIP.x) * s
          const hy = (uy[i] - HAND_FINGERTIP.y) * s
          let x = bx + hx * cos - hy * sin
          let y = by + hx * sin + hy * cos

          // Gathering in from scattered space dust
          const st = T_FORM + delay[i] * FORM_SPREAD
          const f = easeOutCubic(ramp(t, st, st + FORM_DUR))
          x += sx[i] * (1 - f)
          y += sy[i] * (1 - f)
          let alpha = b[i] * f

          // Waiting: fingertip motes peel off, spiral in, then re-form
          if (peel[i] >= 0 && t > T_NEAR - 0.4 && clickedAt === null) {
            const c = ((t - (T_NEAR - 0.4) + peel[i]) % STREAM_CYCLE) / STREAM_CYCLE
            if (c < 0.45) {
              const k = c / 0.45
              const dx = x - O.x
              const dy = y - O.y
              const spin = k * 2.4
              const shrink = 1 - easeInOutSine(k)
              x = O.x + (dx * Math.cos(spin) - dy * Math.sin(spin)) * shrink
              y = O.y + (dx * Math.sin(spin) + dy * Math.cos(spin)) * shrink
              alpha *= 1 - k
            } else {
              alpha *= ramp(c, 0.6, 1)    // back on the fingertip, fading in
            }
          }

          // The blackhole swallows the hand, fingertip first. Each mote gets
          // tugged toward it, then falls in on a curving path that tips into
          // the disk's plane, speeding up as it goes and heating up — drawn
          // as a streak along its path.
          let size = 1.1 + 1.9 * b[i]
          let hasTail = false
          if (clickedAt !== null && u > REACH * 0.6) {
            const turn = REACH + 0.1 + ABSORB_STAGGER * clamp01((ux[i] - 70) / 1500) + (phase[i] / (Math.PI * 2)) * 0.15
            const tug = easeInOutSine(ramp(u, turn - 0.8, turn))
            x += (O.x - x) * 0.06 * tug
            y += (O.y - y) * 0.06 * tug
            alpha *= 1 + 0.5 * tug
            const k = ramp(u, turn, turn + FALL)
            if (k > 0) {
              // Written into `fall` (reused) — no per-mote allocation, which
              // with thousands of motes a frame meant GC stutters
              const dx = x - O.x
              const dy = y - O.y
              const r0 = Math.hypot(dx, dy)
              const th0 = Math.atan2(dy, dx)
              const spin = 2.6 + phase[i] * 0.15
              fallTo(fall, 0, O, r0, th0, spin, Math.max(0, k - 0.07))
              fallTo(fall, 2, O, r0, th0, spin, k)
              x = fall[2]
              y = fall[3]
              hasTail = true
              alpha *= (1 + 0.8 * k) * (1 - ramp(k, 0.82, 1))
              size *= 1 - 0.5 * k
            }
          }

          if (x < -10 || x > vw + 10 || y < -10 || y > vh + 10) continue
          const tw = 0.75 + 0.25 * Math.sin(t * 3 + phase[i])
          if (hasTail && alpha > 0.02) {
            // Batched by brightness (3 groups) — one stroke per group, not per mote
            streaks[Math.min(2, Math.floor(alpha * 0.7 * 3))].push(fall[0], fall[1], x, y)
          }
          drawMote(x, y, size, alpha * tw)
        }
        for (let g = 0; g < 3; g++) {
          const segs = streaks[g]
          if (!segs.length) continue
          ctx.globalAlpha = (g + 0.6) / 3
          ctx.beginPath()
          for (let j = 0; j < segs.length; j += 4) {
            ctx.moveTo(segs[j], segs[j + 1])
            ctx.lineTo(segs[j + 2], segs[j + 3])
          }
          ctx.stroke()
          segs.length = 0
        }

        // Fingertip charge
        if (t > T_FORM + FORM_SPREAD && feed < 0.3) {
          const charge = clamp01(1 - d / 160) * (0.8 + 0.2 * pulse + 0.4 * orbHover) * (1 - ramp(feed, 0, 0.3))
          drawMote(bx, by, 10 + 16 * charge, charge)
        }
      }

      // ── Supernova ──
      if (novaOn) {
        const nu = u - U_NOVA

        // Flash
        const fl = ramp(nu, 0, 1.3)
        if (fl < 1) {
          const fa = Math.sin(Math.PI * Math.sqrt(fl))
          glow(O.x, O.y, 0, R * (3 + 22 * easeOutCubic(fl)), [
            [0, `rgba(255, 252, 240, ${fa})`],
            [0.25, `rgba(255, 214, 120, ${fa * 0.7})`],
            [1, 'rgba(255, 140, 20, 0)'],
          ])
        }

        // Light rays bursting out of the blackhole — all in one shape with one
        // radial gradient (was a gradient per ray per frame)
        const rayK = ramp(nu, 0, 2.4)
        if (rayK > 0 && rayK < 1) {
          ctx.beginPath()
          for (const ray of dust.rays) {
            const k = ramp(nu, ray.delay, ray.delay + 2.2)
            if (k <= 0) continue
            const len = ray.len * maxR * easeOutCubic(k)
            const a = ray.a + nu * 0.08
            ctx.moveTo(O.x, O.y)
            ctx.lineTo(O.x + Math.cos(a - ray.width) * len, O.y + Math.sin(a - ray.width) * len)
            ctx.lineTo(O.x + Math.cos(a + ray.width) * len, O.y + Math.sin(a + ray.width) * len)
            ctx.closePath()
          }
          const g = ctx.createRadialGradient(O.x, O.y, 0, O.x, O.y, maxR * 1.2)
          g.addColorStop(0, 'rgba(255, 245, 215, 1)')
          g.addColorStop(0.3, 'rgba(255, 190, 80, 0.45)')
          g.addColorStop(1, 'rgba(255, 140, 20, 0)')
          ctx.globalAlpha = Math.sin(Math.PI * rayK) * 0.55
          ctx.fillStyle = g
          ctx.fill()
        }

        // Shockwave rings, staggered — the first rides the torn edge
        for (let i = 0; i < RINGS; i++) {
          const k = ramp(nu, i * 0.25, i * 0.25 + NOVA * (1 - i * 0.12))
          if (k <= 0 || k >= 1) continue
          const rr = easeOutQuart(k) * maxR * (1 - i * 0.08)
          const a = (1 - k) * (i === 0 ? 0.95 : 0.55)
          const w = (i === 0 ? 5 : 2.5) * (1 - k * 0.6)
          // Glow = a wide faint stroke under the crisp one (shadowBlur on a
          // screen-sized circle was one of the most expensive things here)
          ctx.beginPath()
          ctx.arc(O.x, O.y, rr, 0, Math.PI * 2)
          ctx.globalAlpha = a * 0.25
          ctx.strokeStyle = '#ffaa00'
          ctx.lineWidth = w * 7
          ctx.stroke()
          ctx.globalAlpha = a
          ctx.strokeStyle = i === 1 ? '#fff4d6' : '#ffc738'
          ctx.lineWidth = w
          ctx.stroke()
        }

        // Embers shed by the wavefront
        const E = dust.emb
        if (nova < 0.85) {
          const spawn = Math.round(40 * (1 - nova))
          for (let j = 0; j < spawn; j++) {
            const i = E.next
            E.next = (E.next + 1) % EMBERS
            const a = dust.rand() * Math.PI * 2
            const rr = ragged(holeR, a, nova, t)
            const sp = 120 + dust.rand() * 380
            E.x[i] = O.x + Math.cos(a) * rr
            E.y[i] = O.y + Math.sin(a) * rr
            E.vx[i] = Math.cos(a) * sp + (dust.rand() - 0.5) * 80
            E.vy[i] = Math.sin(a) * sp + (dust.rand() - 0.5) * 80
            E.max[i] = E.life[i] = 0.6 + dust.rand() * 0.9
            E.size[i] = 1 + dust.rand() * 2.6
          }
        }
        for (let i = 0; i < EMBERS; i++) {
          if (E.life[i] <= 0) continue
          E.life[i] -= dt
          E.vx[i] *= 1 - dt * 1.6
          E.vy[i] *= 1 - dt * 1.6
          E.x[i] += E.vx[i] * dt
          E.y[i] += E.vy[i] * dt
          drawMote(E.x[i], E.y[i], E.size[i], E.life[i] / E.max[i])
        }

        if (nova >= 1 && nu > NOVA + 0.6) return finish()
      }

      // Hint fades in once the hand has arrived
      if (clickedAt === null && t >= T_HINT) hint.classList.add('intro__hint--shown')

      raf = requestAnimationFrame(frame)
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('click', onClick, true)
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', waitIdle)
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleId)
      else clearTimeout(idleId)
      window.removeEventListener('resize', measure)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointermove', onMove)
      unblock()
      html.classList.remove('intro-playing', 'intro-covering')
    }
  }, [playing])

  if (!playing) return null

  return (
    <div className="intro" ref={rootRef}>
      <canvas className="intro__canvas" ref={canvasRef} aria-hidden="true" />
      <p className="intro__hint" ref={hintRef} aria-live="polite">
        <span className="intro__hint-mouse">Click the blackhole to continue</span>
        <span className="intro__hint-touch">Tap the blackhole to continue</span>
      </p>
    </div>
  )
}
