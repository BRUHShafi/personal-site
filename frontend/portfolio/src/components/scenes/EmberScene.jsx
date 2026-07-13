import { useEffect, useRef } from 'react'

// Ember / fire scene — a glowing lava bed at the bottom throwing off rising,
// flickering embers, with slow dark smoke drifting up. No stars. 2D canvas RAF.

const EMBER_COUNT = 110
const SMOKE_COUNT = 14

// Warm palette — picked per ember at spawn (r,g,b)
const EMBER_COLORS = [
  [255, 220, 90],   // yellow-white (hottest)
  [255, 160, 40],   // orange
  [255, 110, 20],   // deep orange
  [255, 70, 10],    // red-orange
]

function spawnEmber(w, h, fromBottom = true) {
  const [r, g, b] = EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)]
  return {
    x:        Math.random() * w,
    y:        fromBottom ? h + Math.random() * 40 : Math.random() * h,
    size:     Math.random() * 2.2 + 0.8,
    vy:       Math.random() * 0.9 + 0.5,        // upward speed
    sway:     Math.random() * 0.6 + 0.2,
    swayFreq: Math.random() * 0.02 + 0.008,
    phase:    Math.random() * Math.PI * 2,
    flicker:  Math.random() * 0.06 + 0.03,
    baseAlpha: Math.random() * 0.5 + 0.4,
    r, g, b,
  }
}

function spawnSmoke(w, h) {
  return {
    x:     Math.random() * w,
    y:     h + Math.random() * 100,
    radius: Math.random() * 120 + 80,
    vy:    Math.random() * 0.4 + 0.2,
    drift: Math.random() * 0.3 - 0.15,
    alpha: Math.random() * 0.05 + 0.03,
    phase: Math.random() * Math.PI * 2,
  }
}

export default function EmberScene() {
  const canvasRef = useRef(null)
  const embersRef = useRef([])
  const smokeRef  = useRef([])
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      embersRef.current = Array.from({ length: EMBER_COUNT }, () => spawnEmber(canvas.width, canvas.height, false))
      smokeRef.current  = Array.from({ length: SMOKE_COUNT }, () => spawnSmoke(canvas.width, canvas.height))
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      // ── Base vertical gradient — dark warm, glowing toward the bottom ──
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0.0,  '#0a0503')
      bg.addColorStop(0.45, '#190a04')
      bg.addColorStop(0.75, '#2e0d03')
      bg.addColorStop(0.92, '#591603')
      bg.addColorStop(1.0,  '#9c2c04')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // ── Lava-bed glow rising from the bottom edge ──
      const lava = ctx.createLinearGradient(0, h, 0, h * 0.55)
      lava.addColorStop(0,   'rgba(255, 110, 20, 0.55)')
      lava.addColorStop(0.5, 'rgba(255, 70, 10, 0.18)')
      lava.addColorStop(1,   'rgba(180, 30, 0, 0)')
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = lava
      ctx.fillRect(0, h * 0.55, w, h * 0.45)

      // Pulsing hotspots along the bottom (the brightest lava cracks)
      const hotspots = 5
      for (let i = 0; i < hotspots; i++) {
        const hx   = (w / hotspots) * (i + 0.5)
        const puls = 0.5 + 0.5 * Math.sin(t * 0.02 + i * 1.7)
        const rad  = 140 + puls * 80
        const glow = ctx.createRadialGradient(hx, h, 0, hx, h, rad)
        glow.addColorStop(0,   `rgba(255, 180, 60, ${0.25 + puls * 0.2})`)
        glow.addColorStop(0.4, `rgba(255, 90, 15, ${0.12 + puls * 0.1})`)
        glow.addColorStop(1,   'rgba(255, 60, 0, 0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(hx, h, rad, Math.PI, Math.PI * 2)
        ctx.fill()
      }

      // ── Rising embers (additive glow) ──
      embersRef.current.forEach((e, i) => {
        e.y -= e.vy
        e.x += Math.sin(t * e.swayFreq + e.phase) * e.sway
        // Fade as it rises toward the top
        const heightFade = Math.max(0, e.y / h)
        const flick = 0.6 + 0.4 * Math.sin(t * e.flicker * 10 + e.phase)
        const alpha = e.baseAlpha * heightFade * flick

        if (e.y < -10) { embersRef.current[i] = spawnEmber(w, h, true); return }

        // soft halo for larger embers
        if (e.size > 1.6) {
          const halo = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.size * 5)
          halo.addColorStop(0,   `rgba(${e.r}, ${e.g}, ${e.b}, ${alpha * 0.8})`)
          halo.addColorStop(0.4, `rgba(${e.r}, ${e.g}, ${e.b}, ${alpha * 0.25})`)
          halo.addColorStop(1,   `rgba(${e.r}, ${e.g}, ${e.b}, 0)`)
          ctx.fillStyle = halo
          ctx.beginPath()
          ctx.arc(e.x, e.y, e.size * 5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${e.r}, ${e.g}, ${e.b}, ${alpha})`
        ctx.fill()
      })

      // ── Dark smoke wisps drifting up (normal blend, subtractive feel) ──
      ctx.globalCompositeOperation = 'source-over'
      smokeRef.current.forEach((s, i) => {
        s.y -= s.vy
        s.x += s.drift + Math.sin(t * 0.004 + s.phase) * 0.3
        if (s.y + s.radius < 0) { smokeRef.current[i] = spawnSmoke(w, h); return }
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius)
        g.addColorStop(0, `rgba(15, 6, 2, ${s.alpha})`)
        g.addColorStop(1, 'rgba(15, 6, 2, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // ── Top vignette — darken the upper area so content stays readable ──
      const vig = ctx.createLinearGradient(0, 0, 0, h * 0.5)
      vig.addColorStop(0, 'rgba(5, 2, 1, 0.5)')
      vig.addColorStop(1, 'rgba(5, 2, 1, 0)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h * 0.5)

      t++
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
      className="scene-canvas"
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
