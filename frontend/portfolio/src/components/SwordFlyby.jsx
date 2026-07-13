import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const YELLOW_EMISSIVE = new THREE.Color('#ffaa00')

const SCALE  = 0.442   // 15% down from 0.52
const REST_Y = -1.5    // was -2.2, which parked the blade inside the mask's fade

function FlybyMesh({ scrollProgressRef }) {
  const groupRef = useRef()
  const { scene: original } = useGLTF('/sword.glb')

  // Clone so it renders independently from the hero sword
  const scene = useMemo(() => original.clone(true), [original])

  useEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material]
        mats.forEach((mat) => {
          mat.emissive = YELLOW_EMISSIVE
          mat.emissiveIntensity = 1.0
          mat.needsUpdate = true
        })
      }
    })
  }, [scene])

  useFrame(() => {
    // Delay entry: sword waits off-screen for first 25% of section scroll,
    // then enters from the left — feels like the hero sword reappearing
    const delayed = Math.max(0, (scrollProgressRef.current - 0.25) / 0.75)
    groupRef.current.position.x = -10 + delayed * 22
    groupRef.current.position.y = REST_Y
    groupRef.current.rotation.z = 0  // horizontal
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={SCALE} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
    </group>
  )
}

export default function SwordFlyby() {
  const scrollProgressRef = useRef(0)
  const [mounted, setMounted] = useState(false)
  const [frameloop, setFrameloop] = useState('always')
  const wrapRef = useRef()

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setMounted(true); setFrameloop('always') }
        else { setFrameloop('never') }
      },
      { threshold: 0, rootMargin: '100px 0px 100px 0px' }
    )
    if (wrapRef.current) obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    // Write to a ref (no re-render) — the value is only read inside useFrame
    const handleScroll = () => {
      const el = document.getElementById('intro-section')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vpH  = window.innerHeight
      const progress = (vpH - rect.top) / (rect.height + vpH)
      scrollProgressRef.current = Math.max(0, Math.min(1, progress))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={wrapRef} style={{
      position:      'absolute',
      inset:         0,
      pointerEvents: 'none',
      zIndex:        1,
      // Fade only the very bottom edge. At 70% the fade started above the
      // sword's own resting height and washed the whole blade out.
      WebkitMaskImage: 'linear-gradient(to bottom, black 92%, transparent 100%)',
      maskImage:       'linear-gradient(to bottom, black 92%, transparent 100%)',
    }}>
      {mounted && <Canvas
        frameloop={frameloop}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={0.7}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.7} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={3.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={1.4} color="#ff9900" />
        <pointLight position={[0, 0, 3]} intensity={6.0} color="#ffbb00" distance={14} />
        <FlybyMesh scrollProgressRef={scrollProgressRef} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur levels={5} intensity={1.0} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>}
    </div>
  )
}
