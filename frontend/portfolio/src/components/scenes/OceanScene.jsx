import { useEffect, useRef } from 'react'

// Ocean scene — looking into deep water: god-ray light beams from the surface,
// rising bubbles, drifting fish silhouettes, and slow marine-snow particles.
// No stars. 2D canvas RAF loop.

const FISH_COUNT   = 13
const BUBBLE_COUNT = 50
const SNOW_COUNT   = 60
const RAY_COUNT    = 4

// Mostly dark silhouettes, a couple of subtle accent fish (r,g,b + alpha)
const FISH_COLORS = [
  { col: '10, 35, 55',    alpha: 0.55 },
  { col: '10, 35, 55',    alpha: 0.55 },
  { col: '10, 35, 55',    alpha: 0.55 },
  { col: '14, 50, 70',    alpha: 0.45 },
  { col: '34, 211, 238',  alpha: 0.18 },  // faint cyan
  { col: '255, 140, 60',  alpha: 0.22 },  // faint warm (clownfish hint)
]

function spawnFish(w, h) {
  const dir   = Math.random() < 0.5 ? 1 : -1
  const c     = FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)]
  const size  = Math.random() * 22 + 12
  return {
    x:        dir === 1 ? -size * 2 : w + size * 2,
    y:        Math.random() * h * 0.85 + h * 0.05,
    size,
    dir,
    speed:    Math.random() * 0.5 + 0.25,
    tailFreq: Math.random() * 0.08 + 0.05,
    bobFreq:  Math.random() * 0.006 + 0.003,
    phase:    Math.random() * Math.PI * 2,
    col:      c.col,
    alpha:    c.alpha,
  }
}

function spawnBubble(w, h, fromBottom = true) {
  return {
    x:        Math.random() * w,
    y:        fromBottom ? h + Math.random() * 30 : Math.random() * h,
    size:     Math.random() * 3.5 + 1,
    vy:       Math.random() * 0.7 + 0.4,
    wobAmp:   Math.random() * 0.8 + 0.3,
    wobFreq:  Math.random() * 0.03 + 0.01,
    phase:    Math.random() * Math.PI * 2,
    alpha:    Math.random() * 0.3 + 0.15,
  }
}

function spawnSnow(w, h) {
  return {
    x:     Math.random() * w,
    y:     Math.random() * h,
    size:  Math.random() * 1.4 + 0.4,
    vy:    Math.random() * 0.25 + 0.08,
    drift: Math.random() * 0.3 - 0.15,
    alpha: Math.random() * 0.4 + 0.15,
    phase: Math.random() * Math.PI * 2,
  }
}

function drawFish(ctx, f, t) {
  const wob = Math.sin(t * f.tailFreq + f.phase)
  const by  = f.y + Math.sin(t * f.bobFreq + f.phase) * 4
  ctx.save()
  ctx.translate(f.x, by)
  ctx.scale(f.dir, 1)
  ctx.fillStyle = `rgba(${f.col}, ${f.alpha})`

  // body
  ctx.beginPath()
  ctx.ellipse(0, 0, f.size, f.size * 0.42, 0, 0, Math.PI * 2)
  ctx.fill()

  // tail (wiggles)
  ctx.beginPath()
  ctx.moveTo(-f.size * 0.85, 0)
  ctx.lineTo(-f.size * 1.5, -f.size * 0.4 + wob * f.size * 0.22)
  ctx.lineTo(-f.size * 1.5,  f.size * 0.4 + wob * f.size * 0.22)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

export default function OceanScene() {
  const canvasRef = useRef(null)
  const fishRef   = useRef([])
  const bubbleRef = useRef([])
  const snowRef   = useRef([])
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      fishRef.current   = Array.from({ length: FISH_COUNT }, () => {
        const f = spawnFish(canvas.width, canvas.height)
        f.x = Math.random() * canvas.width   // spread across on first load
        return f
      })
      bubbleRef.current = Array.from({ length: BUBBLE_COUNT }, () => spawnBubble(canvas.width, canvas.height, false))
      snowRef.current   = Array.from({ length: SNOW_COUNT }, () => spawnSnow(canvas.width, canvas.height))
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      // ── Base gradient — lit surface teal down to deep navy ──
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0.0,  '#0d4a5e')
      bg.addColorStop(0.28, '#083848')
      bg.addColorStop(0.6,  '#06222f')
      bg.addColorStop(1.0,  '#04101a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // ── God-ray light beams from the surface (additive) ──
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < RAY_COUNT; i++) {
        const baseX  = (w / RAY_COUNT) * (i + 0.5)
        const sway   = Math.sin(t * 0.004 + i * 1.5) * 60
        const topX   = baseX + sway
        const width  = 60 + Math.sin(t * 0.006 + i) * 20
        const shimmer = 0.05 + 0.04 * (0.5 + 0.5 * Math.sin(t * 0.01 + i * 2))

        ctx.beginPath()
        ctx.moveTo(topX - width * 0.3, 0)
        ctx.lineTo(topX + width * 0.3, 0)
        ctx.lineTo(topX + width,       h)
        ctx.lineTo(topX - width,       h)
        ctx.closePath()
        const ray = ctx.createLinearGradient(0, 0, 0, h)
        ray.addColorStop(0,   `rgba(130, 225, 245, ${shimmer})`)
        ray.addColorStop(0.6, `rgba(80, 180, 210, ${shimmer * 0.4})`)
        ray.addColorStop(1,   'rgba(60, 150, 190, 0)')
        ctx.fillStyle = ray
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'

      // ── Fish silhouettes (mid layer) ──
      fishRef.current.forEach((f, i) => {
        f.x += f.dir * f.speed
        const off = f.size * 2.5
        if ((f.dir === 1 && f.x > w + off) || (f.dir === -1 && f.x < -off)) {
          fishRef.current[i] = spawnFish(w, h)
          return
        }
        drawFish(ctx, f, t)
      })

      // ── Rising bubbles ──
      ctx.globalCompositeOperation = 'lighter'
      bubbleRef.current.forEach((b, i) => {
        b.y -= b.vy
        b.x += Math.sin(t * b.wobFreq + b.phase) * b.wobAmp
        if (b.y < -10) { bubbleRef.current[i] = spawnBubble(w, h, true); return }
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(170, 235, 250, ${b.alpha})`
        ctx.fill()
        // little highlight ring
        ctx.beginPath()
        ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.3, b.size * 0.35, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.8})`
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      // ── Marine snow (slow drifting particles) ──
      snowRef.current.forEach((s) => {
        s.y += s.vy
        s.x += s.drift + Math.sin(t * 0.005 + s.phase) * 0.2
        if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w }
        const tw = 0.6 + 0.4 * Math.sin(t * 0.004 + s.phase)
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 230, 240, ${s.alpha * tw})`
        ctx.fill()
      })

      // ── Depth vignette — darken edges, deepen the bottom ──
      const vig = ctx.createRadialGradient(w / 2, h * 0.4, h * 0.3, w / 2, h * 0.5, h * 0.9)
      vig.addColorStop(0, 'rgba(2, 10, 18, 0)')
      vig.addColorStop(1, 'rgba(2, 10, 18, 0.6)')
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
