import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const YELLOW_EMISSIVE = new THREE.Color('#ffaa00')

function LightningMesh({ scrollProgress }) {
  const groupRef = useRef()
  const { scene: original } = useGLTF('/Lightning.glb')

  const scene = useMemo(() => {
    const cloned = original.clone(true)
    cloned.traverse((node) => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material]
        mats.forEach((mat) => {
          mat.emissive = YELLOW_EMISSIVE
          mat.emissiveIntensity = 0.8
          mat.needsUpdate = true
        })
      }
    })
    return cloned
  }, [original])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const floatX = Math.sin(t * 0.6) * 0.08  // subtle sway

    // Starts at top-right corner, falls all the way down as you scroll
    const delayed = Math.max(0, (scrollProgress - 0.2) / 0.8)
    groupRef.current.position.x = 2.5 + floatX
    groupRef.current.position.y = 3.0 - delayed * 10  // enters from top, falls past bottom
    groupRef.current.rotation.y = t * 0.3
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.4} />
    </group>
  )
}

export default function LightningFall({ sectionId = 'work' }) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById(sectionId)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vpH  = window.innerHeight
      const progress = (vpH - rect.top) / (rect.height + vpH)
      setScrollProgress(Math.max(0, Math.min(1, progress)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionId])

  return (
    <div style={{
      position:      'absolute',
      inset:         0,
      pointerEvents: 'none',
      zIndex:        0,
    }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={2.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff9900" />
        <pointLight position={[4, 0, 3]} intensity={5.0} color="#ffbb00" distance={12} />
        <LightningMesh scrollProgress={scrollProgress} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.5} luminanceThreshold={0.25} luminanceSmoothing={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/Lightning.glb')
