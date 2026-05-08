import { useRef, useEffect } from 'react'

const ORB_DEFS = [
  { r: 80 },
  { r: 55 },
  { r: 42 },
  { r: 65 },
  { r: 35 },
  { r: 50 },
  { r: 45 },
  { r: 30 },
  { r: 60 },
]

const SPEED     = 0.40
const MAX_SPEED = 0.55  // hard cap — collisions can't compound velocity

export default function FloatingOrbs({ accent }) {
  const wrapRef = useRef(null)
  const rafRef  = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const W = () => window.innerWidth
    const H = () => window.innerHeight

    // Spread orbs across a 3×3 grid so they never start clustered
    const cols = 3
    const rows = Math.ceil(ORB_DEFS.length / cols)
    const orbs = ORB_DEFS.map((def, i) => {
      const col    = i % cols
      const row    = Math.floor(i / cols)
      const cellW  = W() / cols
      const cellH  = H() / rows
      const angle  = (i / ORB_DEFS.length) * Math.PI * 2
      return {
        r:  def.r,
        x:  col * cellW + cellW * 0.25 + Math.random() * cellW * 0.5,
        y:  row * cellH + cellH * 0.25 + Math.random() * cellH * 0.5,
        vx: Math.cos(angle) * SPEED * (0.7 + Math.random() * 0.6),
        vy: Math.sin(angle) * SPEED * (0.7 + Math.random() * 0.6),
        el: wrap.children[i],
      }
    })

    function resolveCollision(a, b) {
      const dx   = b.x - a.x
      const dy   = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const min  = a.r + b.r
      if (dist >= min || dist === 0) return

      const nx  = dx / dist
      const ny  = dy / dist
      const dot = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
      if (dot <= 0) return

      a.vx -= dot * nx;  a.vy -= dot * ny
      b.vx += dot * nx;  b.vy += dot * ny

      const overlap = (min - dist) / 2
      a.x -= overlap * nx;  a.y -= overlap * ny
      b.x += overlap * nx;  b.y += overlap * ny
    }

    function tick() {
      const w = W(), h = H()

      for (const o of orbs) {
        o.x += o.vx
        o.y += o.vy
        if (o.x - o.r < 0)   { o.x = o.r;     o.vx =  Math.abs(o.vx) }
        if (o.x + o.r > w)   { o.x = w - o.r; o.vx = -Math.abs(o.vx) }
        if (o.y - o.r < 0)   { o.y = o.r;     o.vy =  Math.abs(o.vy) }
        if (o.y + o.r > h)   { o.y = h - o.r; o.vy = -Math.abs(o.vy) }
      }

      for (let i = 0; i < orbs.length; i++)
        for (let j = i + 1; j < orbs.length; j++)
          resolveCollision(orbs[i], orbs[j])

      // Clamp speed so collisions never compound into fast movement
      for (const o of orbs) {
        const spd = Math.sqrt(o.vx * o.vx + o.vy * o.vy)
        if (spd > MAX_SPEED) {
          o.vx = (o.vx / spd) * MAX_SPEED
          o.vy = (o.vy / spd) * MAX_SPEED
        }
      }

      for (const o of orbs)
        if (o.el) o.el.style.transform = `translate(${o.x - o.r}px, ${o.y - o.r}px)`

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div ref={wrapRef} className="ip-nebulas" aria-hidden="true" style={{ '--accent': accent }}>
      {ORB_DEFS.map((def, i) => (
        <div
          key={i}
          className="ip-nebula"
          style={{
            width:  def.r * 2,
            height: def.r * 2,
            animationDelay: `${-i * 0.9}s`,
          }}
        />
      ))}
    </div>
  )
}
