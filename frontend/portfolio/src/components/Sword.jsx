import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const YELLOW_EMISSIVE = new THREE.Color('#ffaa00')

function SwordMesh({ scrollProgressRef }) {
  const groupRef = useRef()
  const { scene } = useGLTF('/sword.glb')

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

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const floatY = Math.sin(t * 0.8) * 0.12
    // Drop immediately from the first scroll
    const dropProgress = scrollProgressRef.current
    groupRef.current.position.x = 4
    groupRef.current.position.y = -1.5 + floatY + dropProgress * -6
    groupRef.current.rotation.z = -Math.PI / 2
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.35} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
    </group>
  )
}

export default function SwordCanvas({ scrollProgressRef }) {
  const wrapRef = useRef()
  const [frameloop, setFrameloop] = useState('always')

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'),
      { threshold: 0 }
    )
    if (wrapRef.current) obs.observe(wrapRef.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        frameloop={frameloop}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={1}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={2.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff9900" />
        <pointLight position={[4, -1, 3]} intensity={4.0} color="#ffbb00" distance={12} />
        <SwordMesh scrollProgressRef={scrollProgressRef} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.2} luminanceThreshold={0.6} luminanceSmoothing={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/sword.glb')
