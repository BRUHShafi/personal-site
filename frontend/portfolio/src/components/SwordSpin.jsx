import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const YELLOW_EMISSIVE = new THREE.Color('#ffaa00')

function SpinMesh({ scrollProgress }) {
  const groupRef = useRef()
  const { scene: original } = useGLTF('/sword.glb')

  const scene = useMemo(() => {
    const cloned = original.clone(true)
    // Apply scale + rotation so the bounding box matches what's actually rendered
    cloned.scale.set(0.13, 0.13, 0.13)
    cloned.rotation.set(Math.PI / 2, Math.PI / 2, 0)
    // Shift position so geometric center sits at the group origin (the spin point)
    const box    = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    cloned.position.set(-center.x, -center.y, -center.z)

    // Yellow emissive
    cloned.traverse((node) => {
      if (node.isMesh && node.material) {
        const mats = Array.isArray(node.material) ? node.material : [node.material]
        mats.forEach((mat) => {
          mat.emissive = YELLOW_EMISSIVE
          mat.emissiveIntensity = 0.55
          mat.needsUpdate = true
        })
      }
    })
    return cloned
  }, [original])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    // Enter from right, travel left as you scroll
    // Delay entry slightly (wait for first 20% of section scroll)
    const delayed = scrollProgress
    groupRef.current.position.x = 10 - delayed * 22   // right → left
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
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('skills')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vpH  = window.innerHeight
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
        <pointLight position={[0, 0, 3]} intensity={4.0} color="#ffbb00" distance={12} />
        <SpinMesh scrollProgress={scrollProgress} />
        <EffectComposer multisampling={0}>
          <Bloom intensity={1.2} luminanceThreshold={0.3} luminanceSmoothing={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
