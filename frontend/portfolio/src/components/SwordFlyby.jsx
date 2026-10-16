import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import BandCamera from './BandCamera'
import Portal from './Portal'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'

// The About section's sword: the same blade that vanished into the hero's
// Portal #1 comes *out* of Portal #2 (left edge) as you arrive, rests there
// while you read, then on the next scroll flies right into Portal #3.

const SCALE  = 2.0     // sword is 2 × SCALE long, lying flat
const REST_Y = -1.5    // the blade's height — portals sit on the same line

// The canvas only covers this band of the section (fractions of its height).
// REST_Y = -1.5 puts the blade ~69–82% down; the rest is portal + Bloom margin.
// Move REST_Y → move the band too, or the sword/portals get clipped.
const BAND_TOP    = 0.58
const BAND_HEIGHT = 0.34

// Half the camera's visible height at z = 0 (camera z = 7, fov 45°)
const HALF_VIEW_H = 7 * Math.tan((45 / 2) * Math.PI / 180)

// ── Portals #2 / #3 ──
const PORTAL_SCALE  = 0.75   // 0.75 × 1.6 = 1.2 units tall — fits the band
const PORTAL_INSET  = 1.3    // distance from the screen edge to each portal
const PORTAL_TILT   = 0.5    // radians each opening leans toward the camera
const PORTAL_FLARE  = 1.6    // extra intensity at the peak of a crossing

// ── Timeline ──
// `a` = how far About has scrolled, in viewports: −1 while the hero fills the
// screen, 0 when About is snapped in. This lines up with the hero's progress
// (a = heroProgress − 1), so the handoff stays in sync with Portal #1, where
// the hero sword is fully in at ≈ 0.77 (a ≈ −0.23).
const P2_OPEN    = [-0.28, -0.18]   // Portal #2 opens
const EMERGE     = [-0.16, 0]       // sword slides out of #2, settles at rest
const P3_OPEN    = [0.05, 0.2]      // next scroll: #3 opens ahead of it
const FLY        = [0.05, 0.6]      // sword flies right, into #3
// Portals stay open once opened. Render from just before #2 opens until
// About has scrolled fully away (then the observer pauses it anyway)
const ACTIVE     = [P2_OPEN[0] - 0.05, 1.5]

// Where the sword's centre sits: x = tip − SCALE. Resting position leaves a
// small gap between the pommel and Portal #2.
const REST_GAP = 0.6

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const ramp = (a, [from, to]) => clamp01((a - from) / (to - from))
const smooth = (t) => t * t * (3 - 2 * t)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

// Portal x positions for a given section aspect (width / height)
const portalXFor = (aspect) => HALF_VIEW_H * aspect - PORTAL_INSET

// Sword centre x for a given `a`
function swordX(a, portalX) {
  const inside = -portalX - SCALE           // tip just touching Portal #2
  const rest   = -portalX + SCALE + REST_GAP // pommel clear of Portal #2
  const gone   = portalX + SCALE             // pommel through Portal #3
  if (a <= 0) return inside + (rest - inside) * easeOutCubic(ramp(a, EMERGE))
  return rest + (gone - rest) * easeInOutQuad(ramp(a, FLY))
}

// A portal's facing direction as a rotation: plane normal (+Z) turned to face
// `dir` (+1 = right, −1 = left), then leaned toward the camera by PORTAL_TILT
const portalRotation = (dir) => [0, dir * (Math.PI / 2 - PORTAL_TILT), 0]

// Clipping plane for a portal: keep what's on the side its opening faces
function portalPlane(x, dir) {
  const normal = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(...portalRotation(dir)))
  return new THREE.Plane().setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(x, REST_Y, 0))
}

function FlybyMesh({ aRef, portalX, p2OpenRef, p2IntensityRef, p3OpenRef, p3IntensityRef }) {
  const groupRef = useRef()
  const { scene: cached } = useGLTF('/sword-v2.opt.glb')

  // Clip planes: #2 faces right (keep x > its plane), #3 faces left (keep
  // x < its plane). A point must be on the kept side of *both* to draw, so the
  // blade is hidden while still inside #2 and once it has gone into #3.
  const planes = useMemo(() => [portalPlane(-portalX, 1), portalPlane(portalX, -1)], [portalX])

  // Own copy of the model *and its materials*: clone(true) shares materials
  // with the cache, so clipping planes set here would also cut the hero and
  // spin swords.
  const scene = useMemo(() => {
    const copy = cached.clone(true)
    copy.traverse((node) => {
      if (!node.isMesh || !node.material) return
      const mats = (Array.isArray(node.material) ? node.material : [node.material]).map((m) => {
        const mat = m.clone()
        mat.clippingPlanes = planes
        return mat
      })
      node.material = Array.isArray(node.material) ? mats : mats[0]
    })
    return copy
  }, [cached, planes])

  useFrame(() => {
    const a = aRef.current
    const x = swordX(a, portalX)
    groupRef.current.position.x = x
    groupRef.current.position.y = REST_Y
    groupRef.current.rotation.z = -Math.PI / 2   // lay it flat, tip leading right

    // A portal flares while the blade is passing through its plane
    const tip = x + SCALE
    const tail = x - SCALE
    const crossing = (px) => clamp01((tip - px) / (tip - tail)) * clamp01((px - tail) / (tip - tail)) * 4
    p2IntensityRef.current = 1 + PORTAL_FLARE * crossing(-portalX)
    p3IntensityRef.current = 1 + PORTAL_FLARE * crossing(portalX)

    p2OpenRef.current = smooth(ramp(a, P2_OPEN))
    p3OpenRef.current = smooth(ramp(a, P3_OPEN))
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={SCALE} />
    </group>
  )
}

export default function SwordFlyby() {
  const aRef = useRef(-1)
  const wrapRef = useRef()
  const { mounted, onScreen } = useCanvasLifecycle(wrapRef)
  // Only render while something is happening (portal opening → last one shut)
  const [active, setActive] = useState(false)
  // Section width / height — portals hug the screen edges, so they move with it
  const [aspect, setAspect] = useState(() => window.innerWidth / window.innerHeight)

  // Written by FlybyMesh each frame, read by the portals — no re-renders
  const p2OpenRef = useRef(0)
  const p2IntensityRef = useRef(1)
  const p3OpenRef = useRef(0)
  const p3IntensityRef = useRef(1)

  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('intro-section')
      if (!el) return
      const vpH = window.innerHeight
      const a = (window.scrollY - el.offsetTop) / vpH
      aRef.current = a
      setActive(a > ACTIVE[0] && a < ACTIVE[1])
    }
    const handleResize = () => {
      const el = document.getElementById('intro-section')
      if (el) setAspect(el.offsetWidth / el.offsetHeight)
      handleScroll()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const portalX = portalXFor(aspect)

  return (
    <div ref={wrapRef} style={{
      position:      'absolute',
      left:          0,
      right:         0,
      top:           `${BAND_TOP * 100}%`,
      height:        `${BAND_HEIGHT * 100}%`,
      pointerEvents: 'none',
      zIndex:        1,
      // Bloom spreads the portals' glow past the band; without this the halo
      // ends in a hard horizontal line at the canvas's top/bottom edge.
      // Fading the edges lets it dissolve instead. Sword (~32–71% of the band)
      // and portals (~20–80%) sit inside the fully opaque middle.
      WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
      maskImage:       'linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)',
    }}>
      {mounted && <Canvas
        frameloop={onScreen && active ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 7], fov: 45 }}
        style={{ background: 'transparent' }}
        // Full res is affordable because the canvas is only a band (BandCamera).
        // As a full-section canvas, this + MSAA 4 dropped scroll ~103 → ~59fps.
        dpr={[1, 1.5]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          // Per-material clipping planes (the portal planes) are off by default
          gl.localClippingEnabled = true
        }}
      >
        <ambientLight intensity={0.7} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={3.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={1.4} color="#ff9900" />
        <pointLight position={[0, 0, 3]} intensity={6.0} color="#ffbb00" distance={14} />
        <BandCamera top={BAND_TOP} height={BAND_HEIGHT} />
        <FlybyMesh
          aRef={aRef}
          portalX={portalX}
          p2OpenRef={p2OpenRef} p2IntensityRef={p2IntensityRef}
          p3OpenRef={p3OpenRef} p3IntensityRef={p3IntensityRef}
        />
        {/* Portal #2 — left edge, opening faces right; the sword comes out of it */}
        <Portal
          position={[-portalX, REST_Y, 0]}
          rotation={portalRotation(1)}
          scale={PORTAL_SCALE}
          open={p2OpenRef}
          intensity={p2IntensityRef}
          seed={2}
        />
        {/* Portal #3 — right edge, opening faces left; the sword flies into it */}
        <Portal
          position={[portalX, REST_Y, 0]}
          rotation={portalRotation(-1)}
          scale={PORTAL_SCALE}
          open={p3OpenRef}
          intensity={p3IntensityRef}
          seed={3}
        />
        <CanvasWarmup />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur levels={5} intensity={1.0} luminanceThreshold={0.6} luminanceSmoothing={0.3} />
        </EffectComposer>
      </Canvas>}
    </div>
  )
}
