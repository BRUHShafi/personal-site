import { useEffect, useRef } from 'react'

// ── Star config ───────────────────────────────────────────────────────────────
const STAR_COUNT = 280   // per viewport-worth of sky, not in total

// The sky is built this many viewports tall. Scrolling pans across it, so you
// keep uncovering stars you haven't seen. It wraps once you run off the end.
const VIRTUAL_SPAN = 3

// Parallax: distant things drift less. Galaxies sit "further away" than stars,
// so they crawl while the stars slide past them.
const STAR_PARALLAX   = 0.35
const GALAXY_PARALLAX = 0.18

// Stellar classes, roughly by how common they are. `warm` only decides which
// dark tone the star takes in light mode, where colored stars would look wrong.
const STAR_PALETTE = [
  { weight: 52, rgb: '220,225,255', warm: false },  // white-blue — the workhorse
  { weight: 13, rgb: '255,200,80',  warm: true  },  // gold
  { weight: 12, rgb: '150,200,255', warm: false },  // ice blue
  { weight:  8, rgb: '255,150,140', warm: true  },  // rose / red giant
  { weight:  7, rgb: '200,160,255', warm: false },  // violet
  { weight:  5, rgb: '140,255,235', warm: false },  // cyan
  { weight:  3, rgb: '255,120,60',  warm: true  },  // deep orange — rare
]

const PALETTE_TOTAL = STAR_PALETTE.reduce((sum, c) => sum + c.weight, 0)

function pickStarColor() {
  let roll = Math.random() * PALETTE_TOTAL
  for (const entry of STAR_PALETTE) {
    roll -= entry.weight
    if (roll <= 0) return entry
  }
  return STAR_PALETTE[0]
}

function buildStars(width, height) {
  return Array.from({ length: Math.round(STAR_COUNT * VIRTUAL_SPAN) }, () => {
    const r = Math.random()
    // Widened from the old 0.3–3.8 range so the size spread reads as depth
    const size =
      r < 0.62 ? Math.random() * 0.9 + 0.25
    : r < 0.88 ? Math.random() * 1.5 + 0.9
    : r < 0.97 ? Math.random() * 2.2 + 1.8
    :            Math.random() * 2.6 + 3.2   // rare giants
    const color = pickStarColor()
    return {
      x:         Math.random() * width,
      y:         Math.random() * height,
      size,
      baseAlpha: Math.random() * 0.5 + 0.35,
      phase:     Math.random() * Math.PI * 2,
      speed:     Math.random() * 0.008 + 0.012,
      rgb:       color.rgb,
      warm:      color.warm,
    }
  })
}

// ── Galaxy definitions ───────────────────────────────────────────────────────
// yPct is expressed in *virtual field* units, so it runs 0 → VIRTUAL_SPAN, not
// 0 → 1. Every entry is authored by hand: these used to be 7 defs tiled three
// times, which meant the same seven galaxies scrolled past you on repeat.
// armRgb: color of arm particles   coreRgb: bright core color
const GALAXY_DEFS = [
  // ── First screen ──
  { xPct: 0.06, yPct: 0.14, radius: 78, rotation:  0.40, tilt: 0.38, arms: 2, armRgb: [ 80,110,240], coreRgb: '170,195,255' },  // blue-indigo
  { xPct: 0.52, yPct: 0.68, radius: 62, rotation: -0.90, tilt: 0.44, arms: 2, armRgb: [220, 55,175], coreRgb: '255,155,230' },  // magenta
  { xPct: 0.20, yPct: 0.90, radius: 70, rotation:  1.30, tilt: 0.36, arms: 3, armRgb: [ 30,195,170], coreRgb: '130,255,235' },  // cyan-teal
  { xPct: 0.88, yPct: 0.50, radius: 58, rotation: -0.30, tilt: 0.40, arms: 2, armRgb: [255,115, 35], coreRgb: '255,200,110' },  // amber-orange
  { xPct: 0.38, yPct: 0.32, radius: 41, rotation:  0.85, tilt: 0.42, arms: 2, armRgb: [175, 75,255], coreRgb: '215,155,255' },  // purple, small
  { xPct: 0.72, yPct: 0.88, radius: 66, rotation: -1.50, tilt: 0.39, arms: 3, armRgb: [ 60,200, 90], coreRgb: '150,255,170' },  // green
  { xPct: 0.94, yPct: 0.08, radius: 34, rotation:  0.60, tilt: 0.45, arms: 2, armRgb: [255, 60, 80], coreRgb: '255,170,175' },  // red-rose, tiny

  // ── Second screen ──
  { xPct: 0.14, yPct: 1.22, radius: 95, rotation: -0.55, tilt: 0.30, arms: 2, armRgb: [255,180, 40], coreRgb: '255,225,150' },  // gold, huge + edge-on
  { xPct: 0.63, yPct: 1.10, radius: 37, rotation:  1.90, tilt: 0.50, arms: 3, armRgb: [ 90,235,255], coreRgb: '190,250,255' },  // aqua, tiny
  { xPct: 0.31, yPct: 1.55, radius: 72, rotation:  0.15, tilt: 0.41, arms: 2, armRgb: [235, 85,120], coreRgb: '255,180,200' },  // crimson
  { xPct: 0.85, yPct: 1.40, radius: 49, rotation: -1.15, tilt: 0.34, arms: 2, armRgb: [130,120,255], coreRgb: '195,190,255' },  // periwinkle
  { xPct: 0.05, yPct: 1.78, radius: 56, rotation:  2.20, tilt: 0.47, arms: 3, armRgb: [180,255, 90], coreRgb: '225,255,175' },  // lime
  { xPct: 0.55, yPct: 1.92, radius: 88, rotation: -0.70, tilt: 0.28, arms: 2, armRgb: [255,100,220], coreRgb: '255,190,245' },  // hot pink, edge-on
  { xPct: 0.77, yPct: 1.70, radius: 31, rotation:  0.95, tilt: 0.52, arms: 2, armRgb: [255,240,220], coreRgb: '255,255,245' },  // white dwarf cluster

  // ── Third screen ──
  { xPct: 0.22, yPct: 2.18, radius: 64, rotation: -1.80, tilt: 0.43, arms: 3, armRgb: [ 40,150,255], coreRgb: '150,205,255' },  // deep blue
  { xPct: 0.68, yPct: 2.05, radius: 45, rotation:  0.35, tilt: 0.37, arms: 2, armRgb: [255,140, 60], coreRgb: '255,205,150' },  // tangerine
  { xPct: 0.91, yPct: 2.44, radius: 82, rotation:  1.55, tilt: 0.32, arms: 2, armRgb: [150, 60,230], coreRgb: '205,160,255' },  // violet, large
  { xPct: 0.09, yPct: 2.60, radius: 38, rotation: -0.20, tilt: 0.49, arms: 2, armRgb: [ 60,255,190], coreRgb: '170,255,225' },  // mint, small
  { xPct: 0.44, yPct: 2.80, radius: 74, rotation:  2.60, tilt: 0.35, arms: 3, armRgb: [230, 40, 60], coreRgb: '255,150,150' },  // deep red
  { xPct: 0.79, yPct: 2.92, radius: 53, rotation: -1.00, tilt: 0.46, arms: 2, armRgb: [ 90,190,255], coreRgb: '180,225,255' },  // sky blue
]

// ── Pre-render one galaxy onto an offscreen canvas ────────────────────────────
function prerenderGalaxy({ radius, rotation, tilt, arms, armRgb, coreRgb }) {
  const pad  = radius * 2.4
  const size = Math.ceil(pad * 2)
  const cx   = size / 2
  const cy   = size / 2

  const oc  = document.createElement('canvas')
  oc.width  = size
  oc.height = size
  const ctx = oc.getContext('2d')

  // Arms + disk
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.scale(1, tilt)

  // Scale particle counts with radius. A fixed 600 made small galaxies look
  // like dense blobs, and made 20 galaxies cost 3x what 7 did.
  const NUM_ARMS      = arms
  const ARM_PARTICLES = Math.round(radius * 7)
  const DISK_SCATTER  = Math.round(radius * 3)

  for (let arm = 0; arm < NUM_ARMS; arm++) {
    const offset = (arm / NUM_ARMS) * Math.PI * 2
    for (let i = 0; i < ARM_PARTICLES; i++) {
      const t       = i / ARM_PARTICLES
      const angle   = offset + t * Math.PI * 3.5
      const r       = 0.08 * radius + t * radius * 0.88
      const scatter = r * 0.22
      const x = Math.cos(angle) * r + (Math.random() - 0.5) * scatter
      const y = Math.sin(angle) * r + (Math.random() - 0.5) * scatter

      const warmth = 1 - t
      const [rb, gb, bb] = armRgb
      // Blend arm color toward white near the core
      const rc = Math.floor(rb + warmth * (240 - rb))
      const gc = Math.floor(gb + warmth * (230 - gb))
      const bc = Math.floor(bb + warmth * (255 - bb))
      const a  = (0.12 + warmth * 0.6) * (0.4 + Math.random() * 0.6)
      const sz = Math.random() * (warmth * 1.5 + 0.3)

      ctx.beginPath()
      ctx.arc(x, y, sz, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${rc},${gc},${bc},${a})`
      ctx.fill()
    }
  }

  for (let i = 0; i < DISK_SCATTER; i++) {
    const angle  = Math.random() * Math.PI * 2
    const r      = Math.sqrt(Math.random()) * radius * 0.75
    const warmth = 1 - r / radius
    const [rb, gb, bb] = armRgb
    const a = warmth * 0.28 * Math.random()
    ctx.beginPath()
    ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, Math.random() * 1.1, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${rb},${gb},${bb},${a})`
    ctx.fill()
  }

  ctx.restore()

  // Core glow — not tilted, stays round
  ctx.save()
  ctx.translate(cx, cy)
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3)
  core.addColorStop(0,    `rgba(255,255,255,0.95)`)
  core.addColorStop(0.2,  `rgba(${coreRgb},0.85)`)
  core.addColorStop(0.55, `rgba(${coreRgb},0.35)`)
  core.addColorStop(1,    `rgba(0,0,0,0)`)
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = core
  ctx.fill()
  ctx.restore()

  return oc
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StarField() {
  const canvasRef  = useRef(null)
  const starsRef   = useRef([])
  const galaxiesRef = useRef([])   // { offscreen, x, y, size }
  const rafRef     = useRef(null)
  const scrollRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight

      const virtualH = canvas.height * VIRTUAL_SPAN
      starsRef.current = buildStars(canvas.width, virtualH)

      // One pre-render per galaxy. yPct is already in virtual-field units, so
      // each one lands at its own depth down the sky — nothing is repeated.
      galaxiesRef.current = GALAXY_DEFS.map((def) => ({
        offscreen: prerenderGalaxy(def),
        size: Math.ceil(def.radius * 4.8),
        x: canvas.width  * def.xPct,
        y: canvas.height * def.yPct,
      }))
    }

    resize()

    // Rebuilding means 20 galaxy pre-renders. Resize fires on every pixel of a
    // window drag, so wait for it to settle before paying that.
    let resizeTimer = null
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 150)
    }
    window.addEventListener('resize', onResize)

    // Ref, not state — this is read inside the draw loop, never rendered.
    const onScroll = () => { scrollRef.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const vh       = canvas.height
      const virtualH = vh * VIRTUAL_SPAN
      const scroll   = scrollRef.current

      // Pan the field up by the scroll offset, wrapping back around the top.
      const wrapY = (y, parallax) => {
        const v = (y - scroll * parallax) % virtualH
        return v < 0 ? v + virtualH : v
      }

      // ── Galaxies (blitted from offscreen — cheap) ──
      galaxiesRef.current.forEach(({ offscreen, x, y, size }) => {
        const half = size / 2
        const dy   = wrapY(y, GALAXY_PARALLAX)
        // Draw the wrapped twin too, so a galaxy straddling the seam isn't clipped
        for (const py of [dy, dy - virtualH]) {
          if (py + half < 0 || py - half > vh) continue
          ctx.drawImage(offscreen, x - half, py - half, size, size)
        }
      })

      // ── Stars ──
      const isLight = document.documentElement.dataset.theme === 'light'

      starsRef.current.forEach((star) => {
        const sy = wrapY(star.y, STAR_PARALLAX)
        // Two thirds of the field is off-screen at any time. Skipping it here
        // is what pays for tripling the star count.
        if (sy < -8 || sy > vh + 8) return

        const twinkle = Math.sin(frame * star.speed + star.phase)
        const alpha   = star.baseAlpha + twinkle * 0.25
        const glow    = star.size > 1.8

        if (glow) {
          const g = ctx.createRadialGradient(star.x, sy, 0, star.x, sy, star.size * 4)
          const col = isLight
            ? (star.warm ? '50,30,140' : '20,40,160')   // dark indigo / navy in light mode
            : star.rgb                                   // its own stellar color in dark mode
          g.addColorStop(0,   `rgba(${col},${alpha * 0.9})`)
          g.addColorStop(0.4, `rgba(${col},${alpha * 0.3})`)
          g.addColorStop(1,   `rgba(${col},0)`)
          ctx.beginPath()
          ctx.arc(star.x, sy, star.size * 4, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(star.x, sy, star.size, 0, Math.PI * 2)
        ctx.fillStyle = isLight
          ? (star.warm ? `rgba(50,30,140,${alpha})` : `rgba(20,40,180,${alpha})`)
          : `rgba(${star.rgb},${alpha})`
        ctx.fill()
      })

      frame++
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll)
      clearTimeout(resizeTimer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="starfield"
      style={{
        position:      'fixed',
        inset:         0,
        width:         '100vw',
        height:        '100vh',
        pointerEvents: 'none',
        zIndex:        0,
      }}
    />
  )
}
