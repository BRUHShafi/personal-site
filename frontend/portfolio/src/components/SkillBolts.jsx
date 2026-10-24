import { useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Lightning from './Lightning'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'
import { NODES, EDGES, CAT_COLOR } from '../data/skillGraph'

// One 3D lightning bolt on each node of the Skills constellation, glowing in
// its category's colour. The canvas sits exactly on top of the constellation
// SVG (same box) and ignores the pointer, so hovering still reaches the SVG
// underneath; the SVG tells us which node is hovered.
//
// The camera is orthographic and framed to the SVG's viewBox (0 0 100 70), so
// a node at (x, y) in the SVG is the bolt at (x, −y) here — no conversions.

// Bolt height in viewBox units = 2.5 (model) × BOLT_SCALE
const BOLT_SCALE = 2.2
const HOVER_SCALE = 1.25
// Idle glow, and on hover. Dimmed bolts (not linked to the hovered one) use
// the same opacity the SVG used for the old dots
const GLOW       = 0.8
const GLOW_HOVER = 1.4
// A few degrees of lean per bolt so they don't all stand perfectly upright
const tiltFor = (id) => (((id * 37) % 7) - 3) * 0.07

// Frames the camera to the viewBox: x 0 → 100 left to right, y 0 → −70 top to
// bottom. Same "camera.manual" trick as BandCamera, so R3F doesn't reset it.
function ViewBoxCamera() {
  const get  = useThree((s) => s.get)
  const size = useThree((s) => s.size)
  useLayoutEffect(() => {
    const { camera } = get()
    camera.manual = true
    camera.left = 0
    camera.right = 100
    camera.top = 0
    camera.bottom = -70
    camera.near = 0.1
    camera.far = 100
    camera.position.set(0, 0, 10)
    camera.updateProjectionMatrix()
  }, [get, size])
  return null
}

export default function SkillBolts({ hovered }) {
  const wrapRef = useRef()
  const { mounted, onScreen } = useCanvasLifecycle(wrapRef)
  const boltRefs = useRef([])

  // A fresh hover strikes that node's bolt (quick flare, then settles)
  useEffect(() => {
    if (hovered !== null) boltRefs.current[hovered]?.strike({ decay: 0.5 })
  }, [hovered])

  const linked = hovered === null
    ? []
    : EDGES.flatMap(([a, b]) => (a === hovered ? [b] : b === hovered ? [a] : []))

  const glowFor = (id) => {
    if (hovered === null) return GLOW
    if (id === hovered) return GLOW_HOVER
    if (linked.includes(id)) return GLOW * 0.85
    return GLOW * 0.2
  }

  return (
    <div ref={wrapRef} className="constellation__bolts" aria-hidden="true">
      {mounted && <Canvas
        orthographic
        frameloop={onScreen ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ViewBoxCamera />
        {NODES.map((node) => (
          <Lightning
            key={node.id}
            ref={(el) => { boltRefs.current[node.id] = el }}
            position={[node.x, -node.y, 0]}
            rotation={[0, 0, tiltFor(node.id)]}
            scale={BOLT_SCALE * (hovered === node.id ? HOVER_SCALE : 1)}
            color={CAT_COLOR[node.cat]}
            glow={glowFor(node.id)}
            seed={node.id + 1}
            float
            flicker
          />
        ))}
        <CanvasWarmup />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur levels={5} intensity={0.9} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>}
    </div>
  )
}
