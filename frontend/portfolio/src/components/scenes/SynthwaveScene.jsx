import { useEffect, useRef } from 'react'

// Synthwave / Blade Runner 2049 scene — drifting wavy magenta fog over a deep
// violet gradient with a hazy glowing sun. No stars. Pure 2D canvas RAF loop.

// Wavy fog layers, drawn back-to-front. Colors are "r,g,b" strings.
const FOG_LAYERS = [
  { basePct: 0.50, amp: 38, freq: 0.0042, speed: 0.00022, phase: 0.0, color: '120, 40, 170', alpha: 0.30 },
  { basePct: 0.60, amp: 30, freq: 0.0060, speed: 0.00035, phase: 2.1, color: '200, 55, 180', alpha: 0.28 },
  { basePct: 0.70, amp: 46, freq: 0.0033, speed: 0.00028, phase: 4.3, color: '255, 70, 200', alpha: 0.26 },
  { basePct: 0.80, amp: 26, freq: 0.0075, speed: 0.00045, phase: 1.2, color: '150, 70, 230', alpha: 0.24 },
  { basePct: 0.90, amp: 34, freq: 0.0050, speed: 0.00018, phase: 3.7, color: '90, 30, 140',  alpha: 0.34 },
]

const DUST_COUNT = 70

function buildDust(w, h) {
  return Array.from({ length: DUST_COUNT }, () => ({
    x:     Math.random() * w,
    y:     Math.random() * h,
    size:  Math.random() * 1.4 + 0.4,
    drift: Math.random() * 0.25 + 0.05,   // upward speed
    sway:  Math.random() * 0.4 + 0.1,
    phase: Math.random() * Math.PI * 2,
    alpha: Math.random() * 0.4 + 0.2,
  }))
}

export default function SynthwaveScene() {
  const canvasRef = useRef(null)
  const dustRef   = useRef([])
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      dustRef.current = buildDust(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      // Hidden under the loading intro's dark curtain — skip the work, keep looping
      if (document.documentElement.classList.contains('intro-covering')) {
        rafRef.current = requestAnimationFrame(draw)
        return
      }
      const w = canvas.width
      const h = canvas.height

      // ── Base vertical gradient ──
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0.0,  '#0b0518')
      bg.addColorStop(0.42, '#1f0a36')
      bg.addColorStop(0.60, '#52124f')
      bg.addColorStop(0.66, '#9c2470')   // hazy horizon brightening
      bg.addColorStop(0.74, '#3a1248')
      bg.addColorStop(1.0,  '#120722')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // ── Hazy sun glow (upper-center) ──
      const sunX = w * 0.5
      const sunY = h * 0.34
      const sunR = Math.min(w, h) * 0.42
      const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
      sun.addColorStop(0.0,  'rgba(255, 150, 220, 0.55)')
      sun.addColorStop(0.35, 'rgba(220, 70, 180, 0.30)')
      sun.addColorStop(1.0,  'rgba(120, 30, 150, 0)')
      ctx.globalCompositeOperation = 'lighter'
      ctx.beginPath()
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
      ctx.fillStyle = sun
      ctx.fill()

      // ── Wavy fog layers (additive glow) ──
      FOG_LAYERS.forEach((layer) => {
        const baseY = h * layer.basePct
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 10) {
          const y =
            baseY +
            Math.sin(x * layer.freq + t * layer.speed + layer.phase) * layer.amp +
            Math.sin(x * layer.freq * 0.5 + t * layer.speed * 1.4) * layer.amp * 0.4
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.closePath()

        const g = ctx.createLinearGradient(0, baseY - layer.amp * 2, 0, baseY + layer.amp * 3)
        g.addColorStop(0, `rgba(${layer.color}, ${layer.alpha})`)
        g.addColorStop(1, `rgba(${layer.color}, 0)`)
        ctx.fillStyle = g
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      // ── Floating dust motes drifting up ──
      dustRef.current.forEach((d) => {
        d.y -= d.drift
        d.x += Math.sin(t * 0.001 + d.phase) * d.sway * 0.3
        if (d.y < -4) { d.y = h + 4; d.x = Math.random() * w }
        const tw = 0.6 + 0.4 * Math.sin(t * 0.003 + d.phase)
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 190, 240, ${d.alpha * tw})`
        ctx.fill()
      })

      // ── Vignette ──
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, 'rgba(8, 2, 18, 0.55)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, w, h)

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
