import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'
import { HALF_VIEW_H, SCALE, REST_X, REST_Y, rise } from './heroSwordConfig'

const MODEL_URL = '/sword-v2.opt.glb'

// Position/size/rise live in heroSwordConfig.js — Hero.jsx needs the same
// numbers to know when the blade tip reaches the name.

// Multiplies the glow baked into the model's emissive map. 1 = as exported
// from Blender. Raise it if the glow is too faint for the bloom to pick up.
const EMISSIVE_BOOST = 1.0

// Once the blade's lowest point (minus float bob + Bloom margin) clears the top
// of the frame, there's nothing left to draw. Works out to ~99% of hero scroll.
const swordInFrame = (progress) =>
  REST_Y - 0.12 + rise(progress) - SCALE * 1 < HALF_VIEW_H + 0.5

function SwordMesh({ scrollProgressRef }) {
  const groupRef = useRef()
  const { scene } = useGLTF(MODEL_URL)

  // Boost the baked glow instead of replacing it — overwriting mat.emissive
  // with a flat colour would hide the emissive texture painted in Blender.
  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material]
        mats.forEach((mat) => {
          if (mat.userData.baseEmissive === undefined) mat.userData.baseEmissive = mat.emissiveIntensity
          mat.emissiveIntensity = mat.userData.baseEmissive * EMISSIVE_BOOST
        })
      }
    })
  }, [scene])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const floatY = Math.sin(t * 0.8) * 0.12
    // Eased rise (see heroSwordConfig) — slow cut, then it launches out of frame
    const riseProgress = scrollProgressRef.current
    groupRef.current.position.x = REST_X
    groupRef.current.position.y = REST_Y + floatY + rise(riseProgress)
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
  const [inFrame, setInFrame] = useState(true)

  useEffect(() => {
    // Same progress formula as Hero.jsx. Computed here rather than read from
    // scrollProgressRef: child effects run first, so this listener would fire
    // before Hero's and see last frame's value.
    const handleScroll = () => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1)
      setInFrame(swordInFrame(progress))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      {mounted && <Canvas
        frameloop={onScreen && inFrame ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={2.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff9900" />
        <pointLight position={[0, -1, 3]} intensity={4.0} color="#ffbb00" distance={12} />
        <SwordMesh scrollProgressRef={scrollProgressRef} />
        <CanvasWarmup />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur levels={5} intensity={1.0} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>}
    </div>
  )
}

useGLTF.preload(MODEL_URL)
