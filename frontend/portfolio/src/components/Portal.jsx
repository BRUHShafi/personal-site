import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// A glowing gold portal, built entirely in code — an oval shader surface
// (rim + slow inward swirl + dark core) plus a cloud of drifting motes.
// Lives *inside* an existing <Canvas>, so that canvas's Bloom makes the rim glow.
//
// Props
//   position / rotation / scale — normal three.js transforms. The portal's
//       local shape is an upright oval WIDTH × HEIGHT (≈ 1 : 1.6).
//   open      — 0 → 1. Grows the portal from nothing and brings up its light.
//   intensity — 1 = resting. Higher = brighter rim + faster swirl (e.g. while
//       the sword passes through). Both props can also be refs ({ current })
//       so scroll code can drive them every frame without React re-renders.
//
// Tweak the look with the constants below.

const WIDTH  = 1.0
const HEIGHT = 1.6

const RIM_COLOR  = new THREE.Color('#FFD36B')   // bright warm gold
const MID_COLOR  = new THREE.Color('#E8A317')   // amber
const CORE_COLOR = new THREE.Color('#120800')   // near-black amber — the "hole"

// Values > 1 push the rim over Bloom's luminance threshold (0.6) so it glows
const RIM_BRIGHTNESS = 2.2
const SWIRL_SPEED    = 0.12   // radians/sec — calm, not chaotic
const MOTE_SPEED     = 0.05   // lifetimes/sec — how fast motes spiral in

const isSmallScreen = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const read = (v) => (v && typeof v === 'object' && 'current' in v ? v.current : v)

// Small seeded PRNG (mulberry32). Same seed → same motes on every render,
// which keeps the component pure (Math.random() during render isn't).
function seededRandom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Surface shader ───────────────────────────────────────────────────────────
// The plane is already oval in world space, so in UV space the portal is just
// a circle: r = 0 at the centre, r = 1 at the plane's edge.
const surfaceVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const surfaceFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpen;
  uniform float uIntensity;
  uniform vec3  uRim;
  uniform vec3  uMid;
  uniform vec3  uCore;
  uniform float uRimBrightness;
  varying vec2 vUv;

  // Cheap value noise — enough texture for a soft swirl
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 q = vUv * 2.0 - 1.0;
    float r = length(q);
    if (r > 1.0) discard;

    float rimR = 0.78;                       // where the bright ring sits

    // Spiral: rotate with time, and twist more toward the centre (log r),
    // so streaks curl inward instead of just spinning
    float a = atan(q.y, q.x);
    float twist = a + 2.2 * log(max(r, 0.02)) + uTime;
    vec2 sp = vec2(cos(twist), sin(twist)) * (1.5 + r * 2.0);
    float swirl = fbm(sp + vec2(0.0, -uTime * 0.6));

    // Interior: black core → amber toward the rim, streaked by the swirl
    float depth = smoothstep(0.0, rimR, r);
    vec3 inside = mix(uCore, uMid * 0.55, depth * depth);
    inside += uMid * swirl * 0.45 * depth;

    // Rim: sharp-ish inside, long soft falloff outward
    float rimIn  = smoothstep(rimR - 0.10, rimR, r);
    float rimOut = 1.0 - smoothstep(rimR, 1.0, r);
    float rim = rimIn * rimOut;
    float halo = (1.0 - smoothstep(rimR, 1.0, r)) * step(rimR, r);
    vec3 rimCol = mix(uMid, uRim, rim) * uRimBrightness * uIntensity * (0.85 + 0.15 * swirl);

    vec3 col = r < rimR ? inside : vec3(0.0);
    col += rimCol * rim;

    // Alpha: interior is mostly opaque (a hole that hides the stars), the
    // halo beyond the rim fades to nothing
    float alpha = r < rimR ? mix(0.92, 0.75, depth) : rim + halo * 0.35;
    alpha *= uOpen;
    col *= mix(0.3, 1.0, uOpen);

    gl_FragColor = vec4(col, alpha);
  }
`

// ── Mote shader ──────────────────────────────────────────────────────────────
// Each mote has a fixed start angle, speed and phase; its position along an
// inward spiral is worked out on the GPU from time alone — no per-frame JS.
const moteVertex = /* glsl */ `
  uniform float uTime;
  uniform float uOpen;
  uniform float uSize;
  uniform vec2  uHalf;      // half width / height of the oval
  attribute float aAngle;
  attribute float aSpeed;
  attribute float aPhase;
  varying float vAlpha;

  void main() {
    float life = fract(aPhase + uTime * aSpeed);   // 0 at the rim → 1 at centre
    float r = mix(1.15, 0.08, life);
    float a = aAngle + life * 3.5;                  // ~half a turn inward
    vec3 p = vec3(cos(a) * r * uHalf.x, sin(a) * r * uHalf.y, 0.0);

    // Fade in at the rim, out at the centre
    vAlpha = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.75, 1.0, life)) * uOpen;

    vec4 mv = modelViewMatrix * vec4(p * uOpen, 1.0);
    gl_PointSize = uSize * (1.0 - life * 0.5) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const moteFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    // Soft round sprite
    float d = length(gl_PointCoord - 0.5);
    float s = 1.0 - smoothstep(0.0, 0.5, d);
    gl_FragColor = vec4(uColor * 1.8, s * s * vAlpha);
  }
`

export default function Portal({
  position,
  rotation,
  scale = 1,
  open = 1,
  intensity = 1,
  seed = 1,          // different seed → different mote layout per portal
}) {
  const reduced = useMemo(() => prefersReducedMotion(), [])
  const moteCount = useMemo(() => (isSmallScreen() ? 150 : 260), [])
  const timeRef = useRef(0)
  const surfaceRef = useRef()
  const surfaceMatRef = useRef()
  const moteMatRef = useRef()

  const surfaceUniforms = useMemo(() => ({
    uTime:          { value: 0 },
    uOpen:          { value: 0 },
    uIntensity:     { value: 1 },
    uRim:           { value: RIM_COLOR },
    uMid:           { value: MID_COLOR },
    uCore:          { value: CORE_COLOR },
    uRimBrightness: { value: RIM_BRIGHTNESS },
  }), [])

  const moteUniforms = useMemo(() => ({
    uTime:  { value: 0 },
    uOpen:  { value: 0 },
    uSize:  { value: 0.045 },
    uHalf:  { value: new THREE.Vector2(WIDTH / 2, HEIGHT / 2) },
    uColor: { value: RIM_COLOR },
  }), [])

  const moteGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const angle = new Float32Array(moteCount)
    const speed = new Float32Array(moteCount)
    const phase = new Float32Array(moteCount)
    const rand = seededRandom(seed)
    for (let i = 0; i < moteCount; i++) {
      angle[i] = rand() * Math.PI * 2
      speed[i] = MOTE_SPEED * (0.6 + rand() * 0.8)
      phase[i] = rand()
    }
    // Positions are computed in the shader; three.js still wants the attribute
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(moteCount * 3), 3))
    g.setAttribute('aAngle', new THREE.BufferAttribute(angle, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    // Shader moves points away from the origin — keep three.js from culling them
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), HEIGHT)
    return g
  }, [moteCount, seed])

  useFrame((_, delta) => {
    const o = THREE.MathUtils.clamp(read(open), 0, 1)
    const k = Math.max(0, read(intensity))
    // Everything speeds up with intensity. Reduced motion: time stands still,
    // the portal stays visible. delta is capped so a paused canvas doesn't
    // jump when it resumes.
    if (!reduced) timeRef.current += Math.min(delta, 0.1) * (0.6 + 0.4 * k)
    const t = timeRef.current

    // Grow out of a point as it opens (eased, so it doesn't pop)
    const s = o * o * (3 - 2 * o)
    surfaceRef.current.scale.setScalar(Math.max(s, 0.0001))

    // Uniforms are updated through the live materials (three.js objects are
    // meant to be mutated per frame; the memoised objects only seed them)
    const su = surfaceMatRef.current.uniforms
    su.uTime.value = t * SWIRL_SPEED
    su.uOpen.value = o
    su.uIntensity.value = k
    const mu = moteMatRef.current.uniforms
    mu.uTime.value = t
    mu.uOpen.value = o
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* open scales the surface too, so the portal grows out of a point */}
      <mesh renderOrder={1} ref={surfaceRef}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <shaderMaterial
          ref={surfaceMatRef}
          vertexShader={surfaceVertex}
          fragmentShader={surfaceFragment}
          uniforms={surfaceUniforms}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <points geometry={moteGeometry} renderOrder={2}>
        <shaderMaterial
          ref={moteMatRef}
          vertexShader={moteVertex}
          fragmentShader={moteFragment}
          uniforms={moteUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
