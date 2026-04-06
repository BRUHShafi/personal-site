import { useEffect, useRef } from 'react'

// ── Star config ───────────────────────────────────────────────────────────────
const STAR_COUNT = 280

function buildStars(width, height) {
  return Array.from({ length: STAR_COUNT }, () => {
    const r = Math.random()
    const size =
      r < 0.7  ? Math.random() * 1.0 + 0.3
    : r < 0.92 ? Math.random() * 1.4 + 1.0
    :             Math.random() * 2.0 + 1.8
    return {
      x:         Math.random() * width,
      y:         Math.random() * height,
      size,
      baseAlpha: Math.random() * 0.5 + 0.35,
      phase:     Math.random() * Math.PI * 2,
      speed:     Math.random() * 0.008 + 0.012,
      warm:      Math.random() < 0.12,
    }
  })
}

// ── Galaxy definitions — positions as % of viewport ──────────────────────────
// armRgb: color of arm particles   coreRgb: bright core color
const GALAXY_DEFS = [
  { xPct: 0.06, yPct: 0.14, radius: 78,  rotation: 0.4,  tilt: 0.38, armRgb: [80,110,240],  coreRgb: '170,195,255' },  // blue-indigo
  { xPct: 0.52, yPct: 0.68, radius: 62,  rotation: -0.9, tilt: 0.44, armRgb: [220,55,175],  coreRgb: '255,155,230' },  // magenta
  { xPct: 0.20, yPct: 0.90, radius: 70,  rotation: 1.3,  tilt: 0.36, armRgb: [30,195,170],  coreRgb: '130,255,235' },  // cyan-teal
  { xPct: 0.88, yPct: 0.50, radius: 58,  rotation: -0.3, tilt: 0.40, armRgb: [255,115,35],  coreRgb: '255,200,110' },  // amber-orange
  { xPct: 0.38, yPct: 0.32, radius: 52,  rotation: 0.85, tilt: 0.42, armRgb: [175,75,255],  coreRgb: '215,155,255' },  // purple
  { xPct: 0.72, yPct: 0.88, radius: 66,  rotation: -1.5, tilt: 0.39, armRgb: [60,200,90],   coreRgb: '150,255,170' },  // green
  { xPct: 0.92, yPct: 0.10, radius: 55,  rotation: 0.6,  tilt: 0.45, armRgb: [255,60,80],   coreRgb: '255,170,175' },  // red-rose
]

// ── Pre-render one galaxy onto an offscreen canvas ────────────────────────────
function prerenderGalaxy({ radius, rotation, tilt, armRgb, coreRgb }) {
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

  const NUM_ARMS      = 2
  const ARM_PARTICLES = 600
  const DISK_SCATTER  = 200

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
  const galaxiesRef = useRef([])   // { offscreen, x, y }
  const rafRef     = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      starsRef.current = buildStars(canvas.width, canvas.height)

      // Pre-render each galaxy and store its screen position
      galaxiesRef.current = GALAXY_DEFS.map((def) => ({
        offscreen: prerenderGalaxy(def),
        x: canvas.width  * def.xPct,
        y: canvas.height * def.yPct,
        size: Math.ceil(def.radius * 4.8),
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // ── Galaxies (blitted from offscreen — cheap) ──
      galaxiesRef.current.forEach(({ offscreen, x, y, size }) => {
        const half = size / 2
        ctx.drawImage(offscreen, x - half, y - half, size, size)
      })

      // ── Stars ──
      const isLight = document.documentElement.dataset.theme === 'light'

      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(frame * star.speed + star.phase)
        const alpha   = star.baseAlpha + twinkle * 0.25
        const glow    = star.size > 1.8

        if (glow) {
          const g = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4)
          const col = isLight
            ? (star.warm ? '50,30,140'  : '20,40,160')   // dark indigo / navy in light mode
            : (star.warm ? '255,180,50' : '200,210,255')  // gold / white-blue in dark mode
          g.addColorStop(0,   `rgba(${col},${alpha * 0.9})`)
          g.addColorStop(0.4, `rgba(${col},${alpha * 0.3})`)
          g.addColorStop(1,   `rgba(${col},0)`)
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2)
          ctx.fillStyle = g
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = isLight
          ? (star.warm ? `rgba(50,30,140,${alpha})`  : `rgba(20,40,180,${alpha})`)
          : (star.warm ? `rgba(255,200,80,${alpha})` : `rgba(220,225,255,${alpha})`)
        ctx.fill()
      })

      frame++
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
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
