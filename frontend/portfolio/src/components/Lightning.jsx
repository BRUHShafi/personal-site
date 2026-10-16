import { useImperativeHandle, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

// A decorative gold lightning bolt. Drop it inside any existing <Canvas> —
// it's emissive-only (no lights needed) and glows through that canvas's Bloom.
//
// The model (public/Lightning.glb — capital L; hosts are case-sensitive) is a
// 76-triangle zigzag, ~0.4 wide × 2.5 tall × 0.07 deep, centred on its origin
// and standing upright, so rotation/scale pivot around the middle. Its material
// (black base, gold emissive, KHR_materials_emissive_strength 4) is read by
// three's GLTFLoader straight into emissiveIntensity = 4.
//
// Props
//   position / rotation / scale — normal three.js transforms
//   glow     — multiplier on the model's own emissive strength (1 = as exported)
//   float    — slow bob + slight sway on Z
//   flicker  — mostly steady, with occasional quick charged flashes
//   seed     — de-syncs bolts from each other
//   hidden   — invisible at rest; only shows when struck (for transient
//              discharges, e.g. PortalCrackle)
//   ref      — { strike({ decay }) }: snaps in from ~0 over 100ms, flares ~3×,
//              then eases back to idle (or out, if `hidden`) over `decay` s
//
// prefers-reduced-motion: no bob, no flicker; a strike is a gentle fade-in/out.

const MODEL_URL = '/Lightning.glb'

// Tweakables
const BOB_AMPLITUDE   = 0.07   // world units
const BOB_PERIOD      = 5      // seconds
const SWAY_ANGLE      = 0.05   // radians (~3°)
const FLICKER_EVERY   = [2, 6] // seconds between flashes
const FLICKER_LENGTH  = [0.08, 0.15]
const FLICKER_BOOST   = 1.6    // extra brightness at a flash's peak
const STRIKE_IN       = 0.1    // seconds to snap to full size
const STRIKE_FLARE    = 3      // brightness multiplier at the strike's peak
const STRIKE_DECAY    = 0.4    // default seconds to settle after the peak

const HIDDEN_SCALE = 1e-4      // "hidden" = shrunk to nothing, not visible=false,
                               // so the shader still compiles at load (CanvasWarmup)

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const rand = (lo, hi) => lo + Math.random() * (hi - lo)
const easeOut = (t) => 1 - (1 - t) * (1 - t)

export default function Lightning({
  position,
  rotation,
  scale = 1,
  glow = 1,
  float = false,
  flicker = false,
  seed = 1,
  hidden = false,
  ref,
}) {
  const { scene: cached } = useGLTF(MODEL_URL)
  const reduced = useMemo(() => reducedMotion(), [])

  // Own copy of the scene AND its material, so each bolt flickers on its own
  // (clone(true) alone would share one material between all bolts).
  // Geometry stays shared — every bolt draws from the same buffers.
  const scene = useMemo(() => {
    const copy = cached.clone(true)
    copy.traverse((node) => {
      if (!node.isMesh || !node.material) return
      const mat = node.material.clone()
      mat.userData.baseEmissive = node.material.emissiveIntensity
      node.material = mat
    })
    return copy
  }, [cached])

  const motionRef = useRef()                  // bob/sway
  const strikeRef = useRef()                  // strike scale
  const matsRef = useRef(null)
  const state = useRef({ strikeAt: -1, decay: STRIKE_DECAY, nextFlicker: -1, flickerAt: -1, flickerLen: 0 })

  useImperativeHandle(ref, () => ({
    strike({ decay = STRIKE_DECAY } = {}) {
      state.current.strikeAt = performance.now() / 1000
      state.current.decay = decay
    },
  }), [])

  useFrame(({ clock }) => {
    const now = performance.now() / 1000
    const t = clock.elapsedTime
    const s = state.current
    if (!matsRef.current) {
      matsRef.current = []
      scene.traverse((n) => { if (n.isMesh) matsRef.current.push(n.material) })
    }

    // ── Float & sway ──
    if (float && !reduced) {
      const phase = seed * 1.7
      motionRef.current.position.y = Math.sin((t / BOB_PERIOD) * Math.PI * 2 + phase) * BOB_AMPLITUDE
      motionRef.current.rotation.z = Math.sin((t / (BOB_PERIOD * 1.3)) * Math.PI * 2 + phase) * SWAY_ANGLE
    }

    // ── Idle flicker: occasional quick spikes, sometimes a double-flash ──
    let flick = 0
    if (flicker && !reduced) {
      if (s.nextFlicker < 0) s.nextFlicker = now + rand(...FLICKER_EVERY) * (0.5 + (seed % 5) / 5)
      if (now >= s.nextFlicker) {
        s.flickerAt = now
        s.flickerLen = rand(...FLICKER_LENGTH)
        // 30%: a second flash right after the first
        s.nextFlicker = Math.random() < 0.3 ? now + s.flickerLen + 0.06 : now + rand(...FLICKER_EVERY)
      }
      const f = (now - s.flickerAt) / s.flickerLen
      if (f >= 0 && f <= 1) flick = Math.sin(Math.PI * f)   // smooth bump, never a hard strobe
    }

    // ── Strike envelope ──
    let size = hidden ? 0 : 1
    let bright = hidden ? 0 : 1
    const since = s.strikeAt < 0 ? Infinity : now - s.strikeAt
    if (since < STRIKE_IN + s.decay) {
      if (reduced) {
        // Gentle: fade up, fade back — no snap, no flare
        const k = since < STRIKE_IN * 3 ? since / (STRIKE_IN * 3) : 1 - (since - STRIKE_IN * 3) / Math.max(0.01, s.decay)
        size = 1
        bright = Math.max(hidden ? 0 : 1, Math.min(1, k))
      } else if (since < STRIKE_IN) {
        const k = easeOut(since / STRIKE_IN)
        size = Math.max(size, k)
        bright = 1 + (STRIKE_FLARE - 1) * k
      } else {
        const k = easeOut((since - STRIKE_IN) / s.decay)        // 0 → 1 over the decay
        size = hidden ? 1 - k * 0.15 : 1                           // hidden bolts shrink a touch as they fade
        bright = STRIKE_FLARE + ((hidden ? 0 : 1) - STRIKE_FLARE) * k
      }
    }

    strikeRef.current.scale.setScalar(Math.max(HIDDEN_SCALE, size))
    const base = glow * (1 + FLICKER_BOOST * flick)
    for (const m of matsRef.current) m.emissiveIntensity = m.userData.baseEmissive * base * bright
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={motionRef}>
        <group ref={strikeRef} scale={hidden ? HIDDEN_SCALE : 1}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
