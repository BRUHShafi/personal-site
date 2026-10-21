import { useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'
import Portal from './Portal'
import PortalCrackle from './PortalCrackle'
import BandCamera from './BandCamera'
import {
  HALF_VIEW_H, SCALE, REST_X, REST_Y, rise,
  PORTAL_Y, PORTAL_SCALE, PORTAL_ROTATION,
  TIP_ENTERS_AT, FULLY_IN_AT, PORTAL_FLARE,
} from './heroSwordConfig'

const MODEL_URL = '/sword-v2.opt.glb'

// Position/size/rise live in heroSwordConfig.js — Hero.jsx needs the same
// numbers to know when the blade tip reaches the name.

// Multiplies the glow baked into the model's emissive map. 1 = as exported
// from Blender. Raise it if the glow is too faint for the bloom to pick up.
const EMISSIVE_BOOST = 1.0

const clamp01 = (x) => Math.min(1, Math.max(0, x))

// The canvas only covers a centre column of the screen, this many world units
// either side of the sword (BandCamera keeps the camera framing the full
// screen, so nothing moves). Everything drawn — blade, Portal #1 (~0.7 half
// length), its lightning crackle and their Bloom — stays inside ~1.6 units.
// As a full-screen canvas at full res + MSAA 4 it was the main cost of the
// hero ↔ About glide: measured 56fps / 16 dropped frames → ~75fps / 3.
// Widen this if the crackle or glow ever gets cut at the sides.
const COLUMN_HALF_W = 2.2
// How much of the column's left/right edge fades out (fraction of the column),
// so Bloom dissolves instead of ending in a hard vertical line
const COLUMN_FADE = 0.15

// Column width as a fraction of the screen, for a screen aspect (w / h).
// Clamped to 1: on narrow/portrait screens the column is the whole width.
const columnWidthFor = (aspect) => Math.min(1, COLUMN_HALF_W / (HALF_VIEW_H * aspect))

// The portal's plane, as a clipping plane. Its normal is the direction the
// opening faces (down at the sword, tipped toward the camera) — the same
// rotation the Portal mesh uses applied to +Z. three.js keeps what's on the
// normal's side and discards the rest, so anything that has gone *through*
// the opening simply isn't drawn: the blade sinks into the portal.
const PORTAL_PLANE = (() => {
  const normal = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(...PORTAL_ROTATION))
  return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(REST_X, PORTAL_Y, 0))
})()

function SwordMesh({ scrollProgressRef, portalIntensityRef, portalBurstRef }) {
  const prevProgressRef = useRef(null)
  const groupRef = useRef()
  const { scene: cached } = useGLTF(MODEL_URL)

  // Own copy of the model *and its materials*. The flyby/spin swords clone the
  // same cached scene, and clone(true) shares materials — so a clipping plane
  // set on a shared material would cut those swords too, in their own canvases.
  const scene = useMemo(() => {
    const copy = cached.clone(true)
    copy.traverse((node) => {
      if (!node.isMesh || !node.material) return
      const mats = (Array.isArray(node.material) ? node.material : [node.material]).map((m) => {
        const mat = m.clone()
        // Boost the baked glow instead of replacing it — overwriting emissive
        // with a flat colour would hide the emissive texture painted in Blender
        mat.emissiveIntensity = m.emissiveIntensity * EMISSIVE_BOOST
        mat.clippingPlanes = [PORTAL_PLANE]
        return mat
      })
      node.material = Array.isArray(node.material) ? mats : mats[0]
    })
    return copy
  }, [cached])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const floatY = Math.sin(t * 0.8) * 0.12
    // Eased rise (see heroSwordConfig) — slow cut, then up into the portal
    const p = scrollProgressRef.current
    groupRef.current.position.x = REST_X
    groupRef.current.position.y = REST_Y + floatY + rise(p)

    // Portal flares while the blade passes through. It stays open afterwards —
    // the stage slides away instead (Hero.jsx)
    const crossing = clamp01((p - TIP_ENTERS_AT) / (FULLY_IN_AT - TIP_ENTERS_AT))
    portalIntensityRef.current = 1 + PORTAL_FLARE * Math.sin(Math.PI * crossing)

    // Lightning burst the moment the tip crosses into the portal (either way)
    const prev = prevProgressRef.current
    if (prev !== null && (prev - TIP_ENTERS_AT) * (p - TIP_ENTERS_AT) < 0) portalBurstRef.current++
    prevProgressRef.current = p
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={SCALE} />
    </group>
  )
}

export default function SwordCanvas({ scrollProgressRef }) {
  const wrapRef = useRef()
  const { mounted, onScreen } = useCanvasLifecycle(wrapRef)
  // Written by SwordMesh each frame, read by Portal — no React re-renders
  const portalIntensityRef = useRef(1)
  const portalBurstRef = useRef(0)

  // The stage is position: fixed, so IntersectionObserver always reports it
  // on screen (and it ignores visibility: hidden). Gate on hero progress
  // instead: once the hero is fully scrolled past, the sword is inside the
  // portal and the portal has closed — nothing left to draw.
  const [heroActive, setHeroActive] = useState(true)
  const [aspect, setAspect] = useState(() => window.innerWidth / window.innerHeight)
  useEffect(() => {
    const handleResize = () => setAspect(window.innerWidth / window.innerHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const columnW = columnWidthFor(aspect)
  const columnLeft = (1 - columnW) / 2
  // No fade when the column is the full width — the screen edge is the edge
  const fade = columnW < 1
    ? `linear-gradient(to right, transparent, black ${COLUMN_FADE * 100}%, black ${100 - COLUMN_FADE * 100}%, transparent)`
    : 'none'
  useEffect(() => {
    // Same progress formula as Hero.jsx (child effects run first, so reading
    // scrollProgressRef here would see last frame's value)
    const handleScroll = () => setHeroActive(window.scrollY / window.innerHeight < 1)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={wrapRef} style={{
      position:        'absolute',
      top:             0,
      bottom:          0,
      left:            `${columnLeft * 100}%`,
      width:           `${columnW * 100}%`,
      WebkitMaskImage: fade,
      maskImage:       fade,
    }}>
      {mounted && <Canvas
        frameloop={onScreen && heroActive ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          // Per-material clipping planes (the portal plane) are off by default
          gl.localClippingEnabled = true
        }}
      >
        <ambientLight intensity={0.4} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={2.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff9900" />
        <pointLight position={[0, -1, 3]} intensity={4.0} color="#ffbb00" distance={12} />
        <BandCamera left={columnLeft} width={columnW} />
        <SwordMesh
          scrollProgressRef={scrollProgressRef}
          portalIntensityRef={portalIntensityRef}
          portalBurstRef={portalBurstRef}
        />
        {/* Portal #1 — a hole in the ceiling; the blade rises into it */}
        <Portal
          position={[REST_X, PORTAL_Y, 0]}
          rotation={PORTAL_ROTATION}
          scale={PORTAL_SCALE}
          intensity={portalIntensityRef}
        />
        <PortalCrackle
          position={[REST_X, PORTAL_Y, 0]}
          rotation={PORTAL_ROTATION}
          portalScale={PORTAL_SCALE}
          burstRef={portalBurstRef}
        />
        <CanvasWarmup />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur levels={5} intensity={1.0} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>}
    </div>
  )
}

useGLTF.preload(MODEL_URL)
