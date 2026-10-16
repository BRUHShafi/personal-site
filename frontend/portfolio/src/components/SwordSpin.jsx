import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import BandCamera from './BandCamera'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'
import * as THREE from 'three'

// The canvas only covers this band of the section (fractions of its height).
// The sword spins around y = 1.9, sweeping ~7–28% down; the rest is Bloom margin.
// Move the y in useFrame → move the band too, or the sword gets clipped.
const BAND_TOP    = 0
const BAND_HEIGHT = 0.36

const SCALE = 0.6   // v2 model; kept ~0.37× the hero sword, as with v1

// Half the camera's visible height at z = 0 (camera z = 7, fov 45°)
const HALF_VIEW_H = 7 * Math.tan((45 / 2) * Math.PI / 180)
// Spinning, the sword sweeps a circle of radius SCALE (half its length) + Bloom
const SWORD_REACH = SCALE * 1 + 0.5

// Same maths useFrame uses, so the pause decision matches what's drawn
const spinX = (progress) => 10 - progress * 22   // right → left

function SpinMesh({ scrollProgressRef }) {
  const groupRef = useRef()
  const { scene: original } = useGLTF('/sword-v2.opt.glb')

  const scene = useMemo(() => {
    const cloned = original.clone(true)
    cloned.scale.set(SCALE, SCALE, SCALE)
    // Shift position so geometric center sits at the group origin (the spin point)
    const box    = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    cloned.position.set(-center.x, -center.y, -center.z)
    // No emissive override — the glow is baked into the v2 model's emissive map.
    return cloned
  }, [original])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Enter from right, travel left as you scroll
    // Delay entry slightly (wait for first 20% of section scroll)
    groupRef.current.position.x = spinX(scrollProgressRef.current)
    groupRef.current.position.y = 1.9  // raised to sit over the heading

    // Slow continuous spin around Z axis (one full rotation every ~4s)
    groupRef.current.rotation.z = t * 0.5
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

export default function SwordSpin() {
  const scrollProgressRef = useRef(0)
  const wrapRef = useRef()
  const { mounted, onScreen } = useCanvasLifecycle(wrapRef)
  // The sword starts off the right edge and ends off the left — no point
  // rendering the band while it's out there.
  const [swordInFrame, setSwordInFrame] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('skills')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vpH  = window.innerHeight
      const progress = Math.max(0, Math.min(1, (vpH - rect.top) / (rect.height + vpH)))
      scrollProgressRef.current = progress

      const halfViewW = HALF_VIEW_H * (rect.width / rect.height)
      setSwordInFrame(Math.abs(spinX(progress)) < halfViewW + SWORD_REACH)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div ref={wrapRef} style={{
      position:      'absolute',
      left:          0,
      right:         0,
      top:           `${BAND_TOP * 100}%`,
      height:        `${BAND_HEIGHT * 100}%`,
      pointerEvents: 'none',
      zIndex:        0,
    }}>
      {mounted && <Canvas
        frameloop={onScreen && swordInFrame ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        // Full res is affordable because the canvas is only a band (BandCamera).
        // As a full-section canvas, this + MSAA 4 dropped scroll ~103 → ~59fps.
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={2.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff9900" />
        <pointLight position={[0, 0, 3]} intensity={4.0} color="#ffbb00" distance={12} />
        <BandCamera top={BAND_TOP} height={BAND_HEIGHT} />
        <SpinMesh scrollProgressRef={scrollProgressRef} />
        <CanvasWarmup />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur levels={5} intensity={1.0} luminanceThreshold={0.4} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>}
    </div>
  )
}
