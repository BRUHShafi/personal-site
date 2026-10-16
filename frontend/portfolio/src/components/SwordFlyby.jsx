import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import BandCamera from './BandCamera'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'

const SCALE  = 2.0     // v2 model; kept ~1.26× the hero sword, as with v1
const REST_Y = -1.5    // was -2.2, which parked the blade inside the mask's fade

// The canvas only covers this band of the section (fractions of its height).
// REST_Y = -1.5 puts the blade ~69–82% of the way down; the rest is Bloom margin.
// Move REST_Y → move the band too, or the sword gets clipped.
const BAND_TOP    = 0.58
const BAND_HEIGHT = 0.34

// Half the camera's visible height at z = 0 (camera z = 7, fov 45°)
const HALF_VIEW_H = 7 * Math.tan((45 / 2) * Math.PI / 180)
// How far the sword (plus its Bloom halo) reaches either side of its centre
const SWORD_REACH = SCALE * 1 + 0.5

// Same maths useFrame uses, so the pause decision matches what's drawn
const flybyX = (progress) => -10 + Math.max(0, (progress - 0.25) / 0.75) * 22

function FlybyMesh({ scrollProgressRef }) {
  const groupRef = useRef()
  const { scene: original } = useGLTF('/sword-v2.opt.glb')

  // Clone so it renders independently from the hero sword
  const scene = useMemo(() => original.clone(true), [original])

  // No emissive override — the glow is baked into the v2 model's emissive map.

  useFrame(() => {
    // Delay entry: sword waits off-screen for first 25% of section scroll,
    // then enters from the left — feels like the hero sword reappearing
    groupRef.current.position.x = flybyX(scrollProgressRef.current)
    groupRef.current.position.y = REST_Y
    groupRef.current.rotation.z = -Math.PI / 2  // lay it flat, tip leading to the right
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={SCALE} />
    </group>
  )
}

export default function SwordFlyby() {
  const scrollProgressRef = useRef(0)
  const wrapRef = useRef()
  const { mounted, onScreen } = useCanvasLifecycle(wrapRef)
  // The section can be on screen while the sword is still waiting off the left
  // edge (first 25% of scroll) or has already flown off the right — rendering
  // then would just be Bloom over empty sky.
  const [swordInFrame, setSwordInFrame] = useState(false)

  useEffect(() => {
    // Write to a ref (no re-render) — the value is only read inside useFrame.
    // swordInFrame is a bool, so React skips re-renders unless it flips.
    const handleScroll = () => {
      const el = document.getElementById('intro-section')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vpH  = window.innerHeight
      const progress = Math.max(0, Math.min(1, (vpH - rect.top) / (rect.height + vpH)))
      scrollProgressRef.current = progress

      const halfViewW = HALF_VIEW_H * (rect.width / rect.height)
      setSwordInFrame(Math.abs(flybyX(progress)) < halfViewW + SWORD_REACH)
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
      zIndex:        1,
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
        <ambientLight intensity={0.7} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={3.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={1.4} color="#ff9900" />
        <pointLight position={[0, 0, 3]} intensity={6.0} color="#ffbb00" distance={14} />
        <BandCamera top={BAND_TOP} height={BAND_HEIGHT} />
        <FlybyMesh scrollProgressRef={scrollProgressRef} />
        <CanvasWarmup />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur levels={5} intensity={1.0} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>}
    </div>
  )
}
