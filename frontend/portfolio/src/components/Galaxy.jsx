import { useEffect, useRef } from 'react'

const NUM_ARMS      = 2
const ARM_PARTICLES = 900
const DISK_SCATTER  = 300

function buildGalaxy(radius) {
  const particles = []

  for (let arm = 0; arm < NUM_ARMS; arm++) {
    const armOffset = (arm / NUM_ARMS) * Math.PI * 2
    for (let i = 0; i < ARM_PARTICLES; i++) {
      const t       = i / ARM_PARTICLES
      const angle   = armOffset + t * Math.PI * 3.5
      const r       = 0.08 * radius + t * radius * 0.88
      const scatter = r * 0.22
      const dx = (Math.random() - 0.5) * scatter
      const dy = (Math.random() - 0.5) * scatter

      const warmth = 1 - t
      const rc = Math.floor(200 + warmth * 55)
      const gc = Math.floor(130 + warmth * 90)
      const bc = Math.floor(30  + warmth * 180)
      const a  = (0.15 + warmth * 0.65) * (0.5 + Math.random() * 0.5)
      const sz = Math.random() * (warmth * 1.4 + 0.4)

      particles.push({ angle, r, dx, dy, rc, gc, bc, a, sz })
    }
  }

  for (let i = 0; i < DISK_SCATTER; i++) {
    const angle  = Math.random() * Math.PI * 2
    const r      = Math.sqrt(Math.random()) * radius * 0.75
    const warmth = 1 - r / radius
    const rc     = Math.floor(180 + warmth * 75)
    const gc     = Math.floor(110 + warmth * 100)
    const bc     = Math.floor(40  + warmth * 160)
    const a      = warmth * 0.35 * Math.random()
    const sz     = Math.random() * 1.2
    particles.push({ angle, r, dx: 0, dy: 0, rc, gc, bc, a, sz })
  }

  return particles
}

function drawGalaxy(ctx, particles, cx, cy, radius, rotation) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.scale(1, 0.42)

  particles.forEach(({ angle, r, dx, dy, rc, gc, bc, a, sz }) => {
    const x = Math.cos(angle) * r + dx
    const y = Math.sin(angle) * r + dy
    ctx.beginPath()
    ctx.arc(x, y, sz, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${rc},${gc},${bc},${a})`
    ctx.fill()
  })

  const halo = ctx.createRadialGradient(0, 0, radius * 0.1, 0, 0, radius * 1.1)
  halo.addColorStop(0,   'rgba(255,180,60,0.06)')
  halo.addColorStop(0.5, 'rgba(255,120,30,0.04)')
  halo.addColorStop(1,   'rgba(0,0,0,0)')
  ctx.beginPath()
  ctx.arc(0, 0, radius * 1.1, 0, Math.PI * 2)
  ctx.fillStyle = halo
  ctx.fill()

  ctx.restore()

  // Core glow — not tilted, stays round
  ctx.save()
  ctx.translate(cx, cy)
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.28)
  core.addColorStop(0,    'rgba(255,252,220,0.98)')
  core.addColorStop(0.15, 'rgba(255,220,100,0.85)')
  core.addColorStop(0.4,  'rgba(255,160,40,0.5)')
  core.addColorStop(0.7,  'rgba(255,90,10,0.2)')
  core.addColorStop(1,    'rgba(0,0,0,0)')
  ctx.beginPath()
  ctx.arc(0, 0, radius * 0.28, 0, Math.PI * 2)
  ctx.fillStyle = core
  ctx.fill()
  ctx.restore()
}

export default function Galaxy() {
  const canvasRef  = useRef(null)
  const rafRef     = useRef(null)
  const dataRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const size   = canvas.width   // square canvas
    const radius = size * 0.38
    dataRef.current = buildGalaxy(radius)

    drawGalaxy(ctx, dataRef.current, size / 2, size / 2, radius, 0)

    return () => {}
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={520}
      height={520}
      style={{
        position:      'absolute',
        bottom:        '-60px',   // bleed slightly off-screen for a natural crop
        right:         '-40px',
        pointerEvents: 'none',
        zIndex:        1,
        opacity:       0.92,
      }}
    />
  )
}
