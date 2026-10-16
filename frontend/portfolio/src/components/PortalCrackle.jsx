import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Lightning from './Lightning'

// Electricity discharging off a portal's rim. Not a fixed decoration: a small
// pool of hidden bolts, and every so often one flashes on at a random point on
// the rim, pointing outward, then vanishes (sometimes a double-flash). The
// parent fires a burst all around the rim by bumping `burstRef.current`
// (e.g. when the sword crosses the portal).
//
// Must sit inside a <Canvas>, given the same transform as the <Portal> it
// belongs to.
//
// Props
//   position, rotation, portalScale — same values passed to that <Portal>
//   burstRef — a ref holding a number; each change fires a burst
//   size     — multiplies every bolt's size (e.g. smaller in a tight canvas)

// ── Tweakables ──
const POOL          = 6              // max bolts per portal on screen at once
const EVERY         = [0.4, 1.2]     // seconds between idle discharges
const SCALE         = [0.12, 0.18]   // bolt size (2.5 × scale units long)
const DECAY         = [0.15, 0.25]   // seconds a discharge takes to fade
const DOUBLE_CHANCE = 0.3            // chance of an immediate second flash
const GLOW          = 0.7            // < 1 keeps the core gold, not white
const BURST         = 4              // bolts fired by a burst
const BURST_SCALE   = 0.2

// Portal surface geometry (see Portal.jsx): a WIDTH 1 × HEIGHT 1.6 plane whose
// bright ring sits at 78% of its radius
const RIM = 0.78
const HALF_W = 0.5
const HALF_H = 0.8
const BOLT_HALF_LENGTH = 1.25   // the model is 2.5 tall, pivoting at its middle
const EMBED = 0.8               // < 1 tucks the bolt's root slightly into the rim glow

const tmp = new THREE.Vector3()
const rand = (lo, hi) => lo + Math.random() * (hi - lo)

export default function PortalCrackle({ position, rotation, portalScale, burstRef, size = 1 }) {
  const euler = useMemo(() => new THREE.Euler(...rotation), [rotation])
  const wrapRefs = useRef([])
  const boltRefs = useRef([])
  const sched = useRef({
    next: -1,                       // when the next idle discharge fires
    busyUntil: new Array(POOL).fill(0),
    lastTheta: null,
    pending: null,                  // { i, at } — the second half of a double-flash
    lastBurst: null,
  })

  // World point on the rim at angle θ, plus the outward direction on screen
  // from the portal's centre to it
  const rimPoint = (theta) => {
    tmp.set(Math.cos(theta) * HALF_W * RIM, Math.sin(theta) * HALF_H * RIM, 0)
       .applyEuler(euler)
       .multiplyScalar(portalScale)
    const len = Math.hypot(tmp.x, tmp.y) || 1
    return { x: tmp.x, y: tmp.y, z: tmp.z, dx: tmp.x / len, dy: tmp.y / len }
  }

  // Place bolt i on the rim at θ and strike it
  const fire = (i, theta, scale, decay, now) => {
    const p = rimPoint(theta)
    const s = scale * size
    const reach = BOLT_HALF_LENGTH * s * EMBED
    const w = wrapRefs.current[i]
    w.position.set(position[0] + p.x + p.dx * reach, position[1] + p.y + p.dy * reach, position[2] + p.z)
    // The bolt's long axis is +Y; turn it to point along the outward direction
    w.rotation.set(0, 0, Math.atan2(-p.dx, p.dy))
    w.scale.setScalar(s)
    boltRefs.current[i].strike({ decay })
    sched.current.busyUntil[i] = now + 0.1 + decay
  }

  const freeBolt = (now) => sched.current.busyUntil.findIndex((t) => t <= now)

  useFrame(() => {
    const now = performance.now() / 1000
    const s = sched.current

    // ── Burst on request ──
    const burst = burstRef?.current ?? 0
    if (s.lastBurst !== null && burst !== s.lastBurst) {
      const start = Math.random() * Math.PI * 2
      for (let k = 0; k < BURST; k++) {
        const i = freeBolt(now)
        if (i < 0) break
        const theta = start + (k / BURST) * Math.PI * 2 + rand(-0.3, 0.3)
        fire(i, theta, BURST_SCALE * rand(0.85, 1.15), 0.4, now)
      }
      s.next = now + rand(...EVERY)
    }
    s.lastBurst = burst

    // ── Second half of a double-flash ──
    if (s.pending && now >= s.pending.at) {
      boltRefs.current[s.pending.i].strike({ decay: rand(...DECAY) * 0.7 })
      s.busyUntil[s.pending.i] = now + 0.35
      s.pending = null
    }

    // ── Idle discharge ──
    if (s.next < 0) s.next = now + rand(...EVERY)
    if (now >= s.next) {
      const i = freeBolt(now)
      if (i >= 0) {
        // Never twice in a row in roughly the same spot
        let theta
        do theta = Math.random() * Math.PI * 2
        while (s.lastTheta !== null && Math.abs(Math.atan2(Math.sin(theta - s.lastTheta), Math.cos(theta - s.lastTheta))) < 0.8)
        s.lastTheta = theta
        fire(i, theta, rand(...SCALE), rand(...DECAY), now)
        if (Math.random() < DOUBLE_CHANCE) s.pending = { i, at: now + 0.16 }
      }
      s.next = now + rand(...EVERY)
    }
  })

  return Array.from({ length: POOL }, (_, i) => (
    <group key={i} ref={(el) => { wrapRefs.current[i] = el }}>
      <Lightning
        ref={(el) => { boltRefs.current[i] = el }}
        hidden
        glow={GLOW}
        seed={i + 1}
      />
    </group>
  ))
}
