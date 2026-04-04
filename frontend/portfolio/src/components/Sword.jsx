import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

function SwordMesh({ scrollProgress }) {
  const groupRef = useRef()
  const { scene } = useGLTF('/sword.glb')

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const floatY = Math.sin(t * 0.8) * 0.12
    const dropY = scrollProgress * -5    // drops down as you scroll
    groupRef.current.position.y = -1.5 + floatY + dropY
    groupRef.current.position.x = 4
  })

  return (
    <group ref={groupRef} rotation={[0, 0, -Math.PI / 2]}>
      <primitive
        object={scene}
        scale={0.35}
        rotation={[Math.PI / 2, Math.PI / 2, 0]}
      />
    </group>
  )
}

export default function SwordCanvas({ scrollProgress }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 5]}  intensity={2.5} color="#ffffff" />
        <directionalLight position={[-3, 1, -2]} intensity={0.6} color="#ffe8a0" />
        <SwordMesh scrollProgress={scrollProgress} />
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/sword.glb')
