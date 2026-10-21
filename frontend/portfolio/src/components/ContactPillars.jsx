import { useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useTempleModel } from './templeModel'
import useCanvasLifecycle from '../hooks/useCanvasLifecycle'
import CanvasWarmup from './CanvasWarmup'
import { socials } from '../data/socials'

// Two marble columns (Blender model) standing either side of the contact card,
// the same way the temple gates frame the About portals, each with a social
// link (GitHub / LinkedIn) floating above it. The pillars are sized and placed
// from the card's own box, so they always sit just outside its edges.
//
// On screens too narrow for the pillars they're left out and the two links
// sit in a row under the card instead — the site has no footer, so these are
// the only social links and must never disappear.
//
// Model units: pivot at the bottom centre, 2.2 wide × 9.24 tall.
//
// Nothing in the 3D moves, so the canvas renders on demand — one frame when it
// mounts and again on resize — and costs nothing while you scroll. No Bloom
// either: there's nothing bright enough to glow. The links are plain HTML on
// top of the canvas (clickable, keyboard-focusable, readable by screen readers).

const MODEL_URL = '/pillar.glb'
const MODEL_HEIGHT = 9.24
const MODEL_WIDTH  = 2.2

// Pillar height as a fraction of the card's height
const PILLAR_FIT = 0.6
// px between the card's edge and the pillar
const PILLAR_GAP = 40
// px a pillar must keep from the screen edge, or both are left out
const EDGE_MARGIN = 16

// Link bubbles: diameter, and how far the bubble's bottom floats above the
// pillar top (it bobs ±6px around this — see .pillar-link in Contact.css)
const ICON_SIZE = 56
const ICON_LIFT = 28
// Fallback row under the card: gap below the card, gap between the two
const ROW_DROP = 20
const ROW_GAP  = 24

// Camera: far back with a narrow lens. The pillars sit near the screen edges,
// where the other canvases' wide 45° lens would show a lot of their inner
// side and splay them outward. Same visible height at z = 0 as those canvases.
const CAMERA_Z = 20
const HALF_VIEW_H = 7 * Math.tan((45 / 2) * Math.PI / 180)
const CAMERA_FOV = 2 * Math.atan(HALF_VIEW_H / CAMERA_Z) * 180 / Math.PI

// Card box in section px → pillar placement (world units for the 3D, px for
// the links), or null if the pillars don't fit beside the card
function placePillars({ secW, secH, cardTop, cardH, cardLeft }) {
  const unitsPerPx = (2 * HALF_VIEW_H) / secH
  const heightPx = cardH * PILLAR_FIT
  const scale = (heightPx * unitsPerPx) / MODEL_HEIGHT
  const widthPx = (MODEL_WIDTH * scale) / unitsPerPx

  if (cardLeft - PILLAR_GAP - widthPx < EDGE_MARGIN) return null

  // Standing on the same line as the card's bottom edge (pivot = pillar base)
  const baseYPx = cardTop + cardH
  const leftXPx = cardLeft - PILLAR_GAP - widthPx / 2
  return {
    scale,
    baseY: (secH / 2 - baseYPx) * unitsPerPx,
    x: Math.abs((leftXPx - secW / 2) * unitsPerPx),
    // Link centres: above each pillar top. The card is centred, so the right
    // pillar mirrors the left.
    linkY: baseYPx - heightPx - ICON_LIFT - ICON_SIZE / 2,
    linkX: [leftXPx, secW - leftXPx],
  }
}

// Fallback: the two links side by side, centred under the card
function rowPositions({ secW, cardTop, cardH }) {
  const offset = (ICON_SIZE + ROW_GAP) / 2
  return {
    linkY: cardTop + cardH + ROW_DROP + ICON_SIZE / 2,
    linkX: [secW / 2 - offset, secW / 2 + offset],
  }
}

function Pillar({ position, scale }) {
  const { parts } = useTempleModel(MODEL_URL)
  return (
    <group position={position} scale={scale}>
      {parts.map(({ geometry, material }) => (
        <mesh key={geometry.uuid} geometry={geometry} material={material} />
      ))}
    </group>
  )
}

export default function ContactPillars({ cardRef }) {
  const wrapRef = useRef()
  const { mounted } = useCanvasLifecycle(wrapRef)
  const [layout, setLayout] = useState(null)

  // Measure with offset* (layout box), not getBoundingClientRect: the card and
  // this wrapper both carry .reveal, whose translateY would skew the read
  useEffect(() => {
    const section = wrapRef.current?.parentElement
    const card = cardRef.current
    if (!section || !card) return
    const measure = () => setLayout({
      secW: section.offsetWidth,
      secH: section.offsetHeight,
      cardTop: card.offsetTop,
      cardH: card.offsetHeight,
      cardLeft: card.offsetLeft,
    })
    // Section for window resizes, card for its own height changes (the form
    // swaps to the shorter "sent" message)
    const obs = new ResizeObserver(measure)
    obs.observe(section)
    obs.observe(card)
    return () => obs.disconnect()
  }, [cardRef])

  const placed = layout && placePillars(layout)
  const links = placed ?? (layout && rowPositions(layout))

  return (
    <div ref={wrapRef} className="contact__pillars reveal reveal-delay-2">
      {mounted && placed && <Canvas
        aria-hidden="true"
        frameloop="demand"
        // Static scene: plain MSAA is cheap here, no post-processing needed
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
        style={{ background: 'transparent' }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        {/* Same gold rig as the sword canvases, minus the sword's point light */}
        <ambientLight intensity={0.7} color="#ffcc55" />
        <directionalLight position={[3, 5, 5]}  intensity={3.0} color="#ffd060" />
        <directionalLight position={[-3, 1, -2]} intensity={1.4} color="#ff9900" />
        <Pillar position={[-placed.x, placed.baseY, 0]} scale={placed.scale} />
        <Pillar position={[placed.x, placed.baseY, 0]} scale={placed.scale} />
        <CanvasWarmup />
      </Canvas>}

      {links && socials.map((s, i) => (
        <a
          key={s.label}
          className="pillar-link"
          href={s.href}
          target="_blank"
          // noopener: the opened tab gets no window.opener handle back to us
          rel="noopener noreferrer"
          aria-label={s.label}
          title={s.label}
          style={{
            left: links.linkX[i],
            top: links.linkY,
            width: ICON_SIZE,
            height: ICON_SIZE,
            // Desync the two bobs so they don't float in lockstep
            animationDelay: `${-i * 1.7}s`,
          }}
        >
          {s.icon
            ? <img src={s.icon} alt="" className="pillar-link__icon" />
            : <span className="pillar-link__text">{s.short}</span>}
        </a>
      ))}
    </div>
  )
}

useGLTF.preload(MODEL_URL)
