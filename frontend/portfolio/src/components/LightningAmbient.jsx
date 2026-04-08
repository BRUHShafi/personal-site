import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// x: -4.5 → 4.5  |  y: -2.5 → 2.5  (frustum at z=7, fov=45)
// scale: keep small (0.06–0.14)  |  phase: spreads out start times
const BOLTS = [
  { x: -4.3, y:  2.0, scale: 0.10, rotSpeed: 0.12, swayX: 0.15, swayY: 0.10, fX: 0.40, fY: 0.30, phase: 0.0,  tiltX:  0.3, tiltZ: -0.2 },
  { x: -3.8, y: -0.6, scale: 0.08, rotSpeed: 0.20, swayX: 0.12, swayY: 0.14, fX: 0.50, fY: 0.40, phase: 1.2,  tiltX: -0.2, tiltZ:  0.4 },
  { x: -3.2, y:  2.3, scale: 0.13, rotSpeed: 0.08, swayX: 0.18, swayY: 0.08, fX: 0.30, fY: 0.60, phase: 2.5,  tiltX:  0.5, tiltZ:  0.2 },
  { x: -2.6, y: -1.9, scale: 0.09, rotSpeed: 0.15, swayX: 0.10, swayY: 0.12, fX: 0.60, fY: 0.35, phase: 0.8,  tiltX: -0.4, tiltZ: -0.3 },
  { x: -2.0, y:  0.9, scale: 0.11, rotSpeed: 0.18, swayX: 0.14, swayY: 0.10, fX: 0.45, fY: 0.50, phase: 3.1,  tiltX:  0.2, tiltZ:  0.5 },
  { x: -1.4, y:  2.4, scale: 0.07, rotSpeed: 0.25, swayX: 0.08, swayY: 0.14, fX: 0.55, fY: 0.40, phase: 1.8,  tiltX: -0.3, tiltZ: -0.1 },
  { x: -0.7, y: -2.1, scale: 0.12, rotSpeed: 0.10, swayX: 0.16, swayY: 0.09, fX: 0.35, fY: 0.55, phase: 4.2,  tiltX:  0.4, tiltZ:  0.3 },
  { x: -0.1, y:  1.6, scale: 0.08, rotSpeed: 0.22, swayX: 0.11, swayY: 0.13, fX: 0.50, fY: 0.30, phase: 2.0,  tiltX: -0.1, tiltZ: -0.4 },
  { x:  0.5, y: -0.9, scale: 0.14, rotSpeed: 0.14, swayX: 0.13, swayY: 0.11, fX: 0.40, fY: 0.45, phase: 0.5,  tiltX:  0.3, tiltZ:  0.2 },
  { x:  1.1, y:  2.2, scale: 0.09, rotSpeed: 0.19, swayX: 0.09, swayY: 0.15, fX: 0.60, fY: 0.35, phase: 3.7,  tiltX: -0.5, tiltZ:  0.1 },
  { x:  1.7, y: -1.6, scale: 0.11, rotSpeed: 0.11, swayX: 0.17, swayY: 0.08, fX: 0.30, fY: 0.60, phase: 1.5,  tiltX:  0.1, tiltZ: -0.5 },
  { x:  2.2, y:  0.4, scale: 0.07, rotSpeed: 0.28, swayX: 0.10, swayY: 0.12, fX: 0.55, fY: 0.40, phase: 5.0,  tiltX:  0.4, tiltZ:  0.3 },
  { x:  2.8, y:  2.4, scale: 0.13, rotSpeed: 0.09, swayX: 0.15, swayY: 0.10, fX: 0.40, fY: 0.50, phase: 2.8,  tiltX: -0.2, tiltZ: -0.2 },
  { x:  3.3, y: -0.3, scale: 0.10, rotSpeed: 0.16, swayX: 0.12, swayY: 0.14, fX: 0.45, fY: 0.35, phase: 0.3,  tiltX:  0.3, tiltZ:  0.4 },
  { x:  3.8, y:  1.3, scale: 0.08, rotSpeed: 0.21, swayX: 0.09, swayY: 0.11, fX: 0.50, fY: 0.55, phase: 4.5,  tiltX: -0.4, tiltZ: -0.3 },
  { x:  4.3, y: -2.2, scale: 0.12, rotSpeed: 0.13, swayX: 0.14, swayY: 0.08, fX: 0.35, fY: 0.40, phase: 1.0,  tiltX:  0.2, tiltZ:  0.1 },
  { x: -4.0, y: -2.4, scale: 0.09, rotSpeed: 0.17, swayX: 0.11, swayY: 0.13, fX: 0.60, fY: 0.30, phase: 3.3,  tiltX: -0.3, tiltZ:  0.5 },
  { x:  1.4, y: -2.5, scale: 0.06, rotSpeed: 0.24, swayX: 0.07, swayY: 0.16, fX: 0.50, fY: 0.45, phase: 2.2,  tiltX:  0.5, tiltZ: -0.2 },
  { x: -1.8, y: -0.2, scale: 0.07, rotSpeed: 0.30, swayX: 0.09, swayY: 0.10, fX: 0.55, fY: 0.50, phase: 5.5,  tiltX: -0.1, tiltZ:  0.3 },
  { x:  0.2, y: -1.4, scale: 0.06, rotSpeed: 0.26, swayX: 0.08, swayY: 0.12, fX: 0.45, fY: 0.60, phase: 3.9,  tiltX:  0.4, tiltZ: -0.4 },
]

// Single component renders all bolts — one useFrame, one Canvas, no per-bolt overhead
function AllBolts() {
  const groupRefs = useRef([])
  const { scene: original } = useGLTF('/Lightning.glb')

  // Clone scenes once, with properly cloned materials (avoids shared-ref glitching)
  const scenes = useMemo(() => {
    return BOLTS.map(() => {
      const cloned = original.clone(true)
      cloned.traverse((node) => {
        if (node.isMesh) {
          const mats = Array.isArray(node.material) ? node.material : [node.material]
          const clonedMats = mats.map((mat) => {
            const m = mat.clone()
            m.emissive = new THREE.Color('#ffaa00')
            m.emissiveIntensity = 0.45
            m.needsUpdate = true
            return m
          })
          node.material = clonedMats.length === 1 ? clonedMats[0] : clonedMats
        }
      })
      return cloned
    })
  }, [original])

  // Single animation loop for all 20 bolts
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    BOLTS.forEach((bolt, i) => {
      const ref = groupRefs.current[i]
      if (!ref) return
      const tp = t + bolt.phase
      ref.position.x = bolt.x + Math.sin(tp * bolt.fX) * bolt.swayX
      ref.position.y = bolt.y + Math.sin(tp * bolt.fY + 1.0) * bolt.swayY
      ref.rotation.x = bolt.tiltX
      ref.rotation.y = Math.sin(tp * bolt.rotSpeed) * 1.1
      ref.rotation.z = bolt.tiltZ
    })
  })

  return (
    <>
      {scenes.map((scene, i) => (
        <group key={i} ref={(el) => (groupRefs.current[i] = el)}>
          <primitive object={scene} scale={BOLTS[i].scale} />
        </group>
      ))}
    </>
  )
}

export default function LightningAmbient() {
  return (
    <div style={{
      position:      'fixed',
      inset:         0,
      pointerEvents: 'none',
      zIndex:        0,
    }}>
      <Canvas
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={1}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.3} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]} intensity={1.5} color="#ffd060" />
        <pointLight position={[0, 0, 4]} intensity={3.0} color="#ffbb00" distance={15} />

        <AllBolts />

        <EffectComposer multisampling={0}>
          <Bloom intensity={0.6} luminanceThreshold={0.7} luminanceSmoothing={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/Lightning.glb')
