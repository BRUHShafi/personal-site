import { useEffect, useRef } from 'react'

// Forest scene — dark layered tree silhouettes, soft green-gold light shafts
// through the canopy, drifting blinking fireflies, falling leaves, ground mist.
// No stars. 2D canvas RAF loop. Tree layers are pre-rendered once (cheap blit).

const FIREFLY_COUNT = 34
const LEAF_COUNT    = 16
const SHAFT_COUNT   = 3

const LEAF_COLORS = [
  '74, 124, 60',    // green
  '120, 150, 50',   // yellow-green
  '160, 120, 40',   // amber
  '90, 140, 70',
]

// ── Pre-render the tree silhouette layers onto an offscreen canvas ──
function drawTreeLayer(c, w, h, count, maxH, color, scale) {
  c.fillStyle = color
  for (let i = 0; i < count; i++) {
    const x  = Math.random() * w
    const th = maxH * (0.55 + Math.random() * 0.45)
    const tw = (6 + Math.random() * 10) * scale

    // trunk (tapered)
    c.beginPath()
    c.moveTo(x - tw * 0.5, h)
    c.lineTo(x - tw * 0.18, h - th)
    c.lineTo(x + tw * 0.18, h - th)
    c.lineTo(x + tw * 0.5, h)
    c.closePath()
    c.fill()

    // foliage cluster at the top
    const fy = h - th
    const fr = th * 0.34
    for (let b = 0; b < 5; b++) {
      c.beginPath()
      c.arc(
        x + (Math.random() - 0.5) * fr * 1.4,
        fy + (Math.random() - 0.3) * fr * 0.9,
        fr * (0.5 + Math.random() * 0.55),
        0, Math.PI * 2
      )
      c.fill()
    }
  }
}

function prerenderForest(w, h) {
  const oc = document.createElement('canvas')
  oc.width = w
  oc.height = h
  const c = oc.getContext('2d')
  // far layer (lower, lighter), then near layer (taller, near-black)
  drawTreeLayer(c, w, h, 16, h * 0.5,  'rgba(4, 16, 10, 0.55)', 0.5)
  drawTreeLayer(c, w, h, 10, h * 0.8,  'rgba(2, 9, 5, 0.95)',   0.9)
  return oc
}

function spawnFirefly(w, h) {
  return {
    x:         Math.random() * w,
    y:         Math.random() * h,
    vx:        (Math.random() - 0.5) * 0.4,
    vy:        (Math.random() - 0.5) * 0.3,
    size:      Math.random() * 1.6 + 1,
    blinkFreq: Math.random() * 0.02 + 0.01,
    phase:     Math.random() * Math.PI * 2,
  }
}

function spawnLeaf(w, h, fromTop = true) {
  return {
    x:        Math.random() * w,
    y:        fromTop ? -10 - Math.random() * 40 : Math.random() * h,
    size:     Math.random() * 5 + 3,
    vy:       Math.random() * 0.5 + 0.3,
    swayAmp:  Math.random() * 1.2 + 0.5,
    swayFreq: Math.random() * 0.02 + 0.008,
    rot:      Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    phase:    Math.random() * Math.PI * 2,
    color:    LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    alpha:    Math.random() * 0.4 + 0.3,
  }
}

export default function ForestScene() {
  const canvasRef  = useRef(null)
  const treesRef   = useRef(null)
  const fliesRef   = useRef([])
  const leavesRef  = useRef([])
  const rafRef     = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      treesRef.current  = prerenderForest(canvas.width, canvas.height)
      fliesRef.current  = Array.from({ length: FIREFLY_COUNT }, () => spawnFirefly(canvas.width, canvas.height))
      leavesRef.current = Array.from({ length: LEAF_COUNT }, () => spawnLeaf(canvas.width, canvas.height, false))
    }
    resize()
    window.addEventListener('resize', resize)

    let t = 0
    const draw = () => {
      const w = canvas.width
      const h = canvas.height

      // ── Base gradient — dark canopy to forest floor ──
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0.0,  '#06140d')
      bg.addColorStop(0.4,  '#08180f')
      bg.addColorStop(0.7,  '#0a1f14')
      bg.addColorStop(1.0,  '#051009')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // ── Light shafts through the canopy (additive, green-gold) ──
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < SHAFT_COUNT; i++) {
        const baseX   = (w / SHAFT_COUNT) * (i + 0.5)
        const sway    = Math.sin(t * 0.003 + i * 1.7) * 50
        const topX    = baseX + sway - w * 0.1
        const width   = 80 + Math.sin(t * 0.005 + i) * 24
        const shimmer = 0.04 + 0.03 * (0.5 + 0.5 * Math.sin(t * 0.008 + i * 2))

        ctx.beginPath()
        ctx.moveTo(topX - width * 0.2, 0)
        ctx.lineTo(topX + width * 0.2, 0)
        ctx.lineTo(topX + width * 1.3, h)
        ctx.lineTo(topX - width * 0.9, h)
        ctx.closePath()
        const ray = ctx.createLinearGradient(0, 0, 0, h)
        ray.addColorStop(0,   `rgba(190, 230, 120, ${shimmer})`)
        ray.addColorStop(0.6, `rgba(120, 180, 80, ${shimmer * 0.35})`)
        ray.addColorStop(1,   'rgba(90, 150, 60, 0)')
        ctx.fillStyle = ray
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'

      // ── Tree silhouettes (pre-rendered blit) ──
      if (treesRef.current) ctx.drawImage(treesRef.current, 0, 0)

      // ── Ground mist drifting near the floor ──
      const mistY = h * 0.78
      const mist = ctx.createLinearGradient(0, mistY, 0, h)
      const mistPuls = 0.06 + 0.03 * Math.sin(t * 0.006)
      mist.addColorStop(0, 'rgba(120, 170, 130, 0)')
      mist.addColorStop(1, `rgba(120, 170, 130, ${mistPuls})`)
      ctx.fillStyle = mist
      ctx.fillRect(0, mistY, w, h - mistY)

      // ── Fireflies (additive glow, blinking) ──
      ctx.globalCompositeOperation = 'lighter'
      fliesRef.current.forEach((f) => {
        f.x += f.vx
        f.y += f.vy
        // gentle wander
        f.vx += (Math.random() - 0.5) * 0.02
        f.vy += (Math.random() - 0.5) * 0.02
        f.vx = Math.max(-0.5, Math.min(0.5, f.vx))
        f.vy = Math.max(-0.4, Math.min(0.4, f.vy))
        if (f.x < 0) f.x = w; if (f.x > w) f.x = 0
        if (f.y < 0) f.y = h; if (f.y > h) f.y = 0

        const blink = Math.max(0, Math.sin(t * f.blinkFreq * 10 + f.phase))
        const alpha = blink * 0.9
        if (alpha < 0.02) return

        const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 6)
        halo.addColorStop(0,   `rgba(200, 255, 130, ${alpha * 0.9})`)
        halo.addColorStop(0.4, `rgba(160, 230, 80, ${alpha * 0.3})`)
        halo.addColorStop(1,   'rgba(140, 210, 60, 0)')
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size * 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 255, 160, ${alpha})`
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'

      // ── Falling leaves ──
      leavesRef.current.forEach((l, i) => {
        l.y += l.vy
        l.x += Math.sin(t * l.swayFreq + l.phase) * l.swayAmp
        l.rot += l.rotSpeed
        if (l.y > h + 10) { leavesRef.current[i] = spawnLeaf(w, h, true); return }
        ctx.save()
        ctx.translate(l.x, l.y)
        ctx.rotate(l.rot)
        ctx.fillStyle = `rgba(${l.color}, ${l.alpha})`
        ctx.beginPath()
        ctx.ellipse(0, 0, l.size, l.size * 0.45, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // ── Vignette ──
      const vig = ctx.createRadialGradient(w / 2, h * 0.4, h * 0.3, w / 2, h * 0.5, h * 0.95)
      vig.addColorStop(0, 'rgba(2, 8, 4, 0)')
      vig.addColorStop(1, 'rgba(2, 8, 4, 0.55)')
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
