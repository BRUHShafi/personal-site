import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const YELLOW_EMISSIVE = new THREE.Color('#ffaa00')
const FRUSTUM_H = 2 * Math.tan((45 * Math.PI / 180) / 2) * 7  // ≈ 5.8

// anchorSign: +1 = right side, -1 = left side
const BOLTS = [
  // ── Right side ──
  { anchorSign:  1, xOffset: -0.68, yLand: -2.30, scale: 0.32, rotMul: 0.10, tiltX:  0.35, tiltZ: -0.30, scrollDelay: 0.04, swayAmp: 0.05, swayFreq: 0.55 },
  { anchorSign:  1, xOffset: -0.20, yLand: -1.85, scale: 0.48, rotMul: 0.18, tiltX: -0.20, tiltZ:  0.50, scrollDelay: 0.00, swayAmp: 0.03, swayFreq: 0.70 },
  { anchorSign:  1, xOffset:  0.22, yLand: -2.10, scale: 0.36, rotMul: 0.13, tiltX:  0.50, tiltZ:  0.20, scrollDelay: 0.07, swayAmp: 0.06, swayFreq: 0.45 },
  { anchorSign:  1, xOffset:  0.60, yLand: -1.95, scale: 0.42, rotMul: 0.22, tiltX: -0.40, tiltZ: -0.45, scrollDelay: 0.02, swayAmp: 0.04, swayFreq: 0.62 },
  // ── Left side — different sizes, tilts, speeds, spacing ──
  { anchorSign: -1, xOffset:  0.55, yLand: -2.20, scale: 0.44, rotMul: 0.15, tiltX: -0.45, tiltZ:  0.35, scrollDelay: 0.06, swayAmp: 0.04, swayFreq: 0.60 },
  { anchorSign: -1, xOffset:  0.10, yLand: -1.90, scale: 0.30, rotMul: 0.25, tiltX:  0.30, tiltZ: -0.55, scrollDelay: 0.01, swayAmp: 0.06, swayFreq: 0.50 },
  { anchorSign: -1, xOffset: -0.30, yLand: -2.05, scale: 0.50, rotMul: 0.09, tiltX:  0.60, tiltZ:  0.25, scrollDelay: 0.09, swayAmp: 0.03, swayFreq: 0.75 },
  { anchorSign: -1, xOffset: -0.72, yLand: -1.80, scale: 0.38, rotMul: 0.20, tiltX: -0.25, tiltZ: -0.40, scrollDelay: 0.03, swayAmp: 0.05, swayFreq: 0.40 },
]

function LightningMesh({ scrollProgress, bolt }) {
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
    const t        = state.clock.getElapsedTime()
    const frustumW = FRUSTUM_H * (window.innerWidth / window.innerHeight)

    // Anchor at the edge (right or left), then apply per-bolt offset
    const anchor = bolt.anchorSign * frustumW * 0.42
    const worldX = anchor + bolt.anchorSign * bolt.xOffset + Math.sin(t * bolt.swayFreq) * bolt.swayAmp

    const adjProgress = bolt.scrollDelay > 0
      ? Math.min(1, Math.max(0, (scrollProgress - bolt.scrollDelay) / (1 - bolt.scrollDelay)))
      : scrollProgress
    const worldY = FRUSTUM_H * 0.5 + (bolt.yLand - FRUSTUM_H * 0.5) * adjProgress

    groupRef.current.position.x = worldX
    groupRef.current.position.y = worldY
    groupRef.current.rotation.x = bolt.tiltX
    groupRef.current.rotation.z = bolt.tiltZ
    groupRef.current.rotation.y = t * bolt.rotMul
    groupRef.current.visible    = scrollProgress > bolt.scrollDelay
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={bolt.scale} />
    </group>
  )
}

export default function LightningGlobal() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [clipTop, setClipTop]               = useState(window.innerHeight)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY    = window.scrollY
      const projectsEl = document.getElementById('work')
      const contactEl  = document.getElementById('contact')
      if (!projectsEl || !contactEl) return

      const projectsRect = projectsEl.getBoundingClientRect()
      setClipTop(Math.max(0, projectsRect.top))

      const startScroll = projectsEl.offsetTop
      const endScroll   = document.body.scrollHeight - window.innerHeight
      const progress    = (scrollY - startScroll) / (endScroll - startScroll)
      setScrollProgress(Math.max(0, Math.min(1, progress)))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2,
      clipPath: `inset(${clipTop}px 0 0 0)`,
    }}>
      <Canvas
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        dpr={1}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={2.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={0.8} color="#ff9900" />
        <pointLight position={[4, 0, 3]} intensity={5.0} color="#ffbb00" distance={12} />

        {BOLTS.map((bolt, i) => (
          <LightningMesh key={i} scrollProgress={scrollProgress} bolt={bolt} />
        ))}

        <EffectComposer multisampling={0}>
          <Bloom intensity={1.5} luminanceThreshold={0.65} luminanceSmoothing={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

useGLTF.preload('/Lightning.glb')
