import { useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'
import Portal from './Portal'
import {
  SCALE, REST_X, REST_Y, rise,
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

// The portal's plane, as a clipping plane. Its normal is the direction the
// opening faces (down at the sword, tipped toward the camera) — the same
// rotation the Portal mesh uses applied to +Z. three.js keeps what's on the
// normal's side and discards the rest, so anything that has gone *through*
// the opening simply isn't drawn: the blade sinks into the portal.
const PORTAL_PLANE = (() => {
  const normal = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(...PORTAL_ROTATION))
  return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(REST_X, PORTAL_Y, 0))
})()

function SwordMesh({ scrollProgressRef, portalIntensityRef }) {
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

  // The stage is position: fixed, so IntersectionObserver always reports it
  // on screen (and it ignores visibility: hidden). Gate on hero progress
  // instead: once the hero is fully scrolled past, the sword is inside the
  // portal and the portal has closed — nothing left to draw.
  const [heroActive, setHeroActive] = useState(true)
  useEffect(() => {
    // Same progress formula as Hero.jsx (child effects run first, so reading
    // scrollProgressRef here would see last frame's value)
    const handleScroll = () => setHeroActive(window.scrollY / window.innerHeight < 1)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
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
        <SwordMesh
          scrollProgressRef={scrollProgressRef}
          portalIntensityRef={portalIntensityRef}
        />
        {/* Portal #1 — a hole in the ceiling; the blade rises into it */}
        <Portal
          position={[REST_X, PORTAL_Y, 0]}
          rotation={PORTAL_ROTATION}
          scale={PORTAL_SCALE}
          intensity={portalIntensityRef}
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
