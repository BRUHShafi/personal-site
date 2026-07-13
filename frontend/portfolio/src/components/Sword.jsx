import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const YELLOW_EMISSIVE = new THREE.Color('#ffaa00')

// Where the sword rests before any scrolling. The group origin sits at the
// blade's tip, and the tip points up, so the blade hangs *below* this value —
// it has to sit high in frame for the whole sword to be visible.
const REST_Y = 1.6

// How far up the sword travels over one viewport of scroll. Raise this if the
// blade is still poking into frame by the time the hero has scrolled away.
const RISE_DISTANCE = 6

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
    // Rise immediately from the first scroll — the blade launches up out of frame
    const riseProgress = scrollProgressRef.current
    groupRef.current.position.x = 4
    groupRef.current.position.y = REST_Y + floatY + riseProgress * RISE_DISTANCE
    // +π/2 points the tip up, so the sword travels the way it's aimed
    groupRef.current.rotation.z = Math.PI / 2
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
        dpr={0.7}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={2.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff9900" />
        <pointLight position={[4, -1, 3]} intensity={4.0} color="#ffbb00" distance={12} />
        <SwordMesh scrollProgressRef={scrollProgressRef} />
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur levels={5} intensity={1.0} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/sword.glb')
