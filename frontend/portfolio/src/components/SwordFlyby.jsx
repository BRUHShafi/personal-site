import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const YELLOW_EMISSIVE = new THREE.Color('#ffaa00')

function FlybyMesh({ scrollProgress }) {
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
          mat.emissiveIntensity = 0.55
          mat.needsUpdate = true
        })
      }
    })
  }, [scene])

  useFrame(() => {
    // Travels left → right across the section; y=-0.5 = below center (under heading)
    groupRef.current.position.x = -10 + scrollProgress * 22
    groupRef.current.position.y = -0.5
    groupRef.current.rotation.z = 0  // horizontal
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.35} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
    </group>
  )
}

export default function SwordFlyby() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('intro-section')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vpH  = window.innerHeight
      // 0 when section enters viewport bottom, 1 when section exits viewport top
      const progress = (vpH - rect.top) / (rect.height + vpH)
      setScrollProgress(Math.max(0, Math.min(1, progress)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{
      position:      'absolute',
      inset:         0,
      pointerEvents: 'none',
      zIndex:        1,
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
        <pointLight position={[0, 0, 3]} intensity={4.0} color="#ffbb00" distance={12} />
        <FlybyMesh scrollProgress={scrollProgress} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.2} luminanceThreshold={0.3} luminanceSmoothing={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
