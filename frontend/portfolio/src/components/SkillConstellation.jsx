import { useState } from 'react'
import './SkillConstellation.css'

import SkillBolts from './SkillBolts'
import { NODES, EDGES, CAT_COLOR } from '../data/skillGraph'

// Each node is a 3D lightning bolt (SkillBolts, a canvas laid over this SVG).
// The SVG still draws the links + labels and catches the hover.

// Tiny bolt for the legend, in a 10 × 16 box
const BOLT_PATH = 'M6 0 L1 9 H5 L3 16 L10 6 H6 L8 0 Z'

// Small decorative background stars
const BG_STARS = Array.from({ length: 28 }, (_, i) => ({
  x: ((i * 37.3 + 11.5) % 98) + 1,
  y: ((i * 53.7 + 7.2)  % 66) + 1,
  r: i % 4 === 0 ? 0.4 : 0.2,
}))

export default function SkillConstellation() {
  const [hovered, setHovered] = useState(null)

  const connectedIds = hovered !== null
    ? EDGES.flatMap(([a, b]) => a === hovered ? [b] : b === hovered ? [a] : [])
    : []

  const nodeOpacity = (id) => {
    if (hovered === null)    return 1
    if (id === hovered)      return 1
    if (connectedIds.includes(id)) return 0.85
    return 0.2
  }

  const edgeOpacity = ([a, b]) => {
    if (hovered === null) return 0.35
    if (a === hovered || b === hovered) return 0.9
    return 0.05
  }

  const edgeColor = ([a, b]) => {
    if (hovered === null) return 'var(--text-light)'
    if (a === hovered || b === hovered) return CAT_COLOR[NODES[hovered].cat]
    return 'var(--text-light)'
  }

  return (
    <div className="constellation">
      {/* Category legend */}
      <div className="constellation__legend">
        {Object.entries(CAT_COLOR).map(([cat, color]) => (
          <span key={cat} className="constellation__legend-item">
            <svg className="constellation__legend-bolt" viewBox="0 0 10 16" style={{ color }} aria-hidden="true">
              <path d={BOLT_PATH} fill="currentColor" />
            </svg>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </span>
        ))}
      </div>

      <div className="constellation__stage">
        <svg
          className="constellation__svg"
          viewBox="0 0 100 70"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background stars */}
          {BG_STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="var(--text-muted)" opacity={0.25} />
          ))}

          {/* Edges */}
          {EDGES.map(([a, b], i) => (
            <line
              key={i}
              x1={NODES[a].x} y1={NODES[a].y}
              x2={NODES[b].x} y2={NODES[b].y}
              stroke={edgeColor([a, b])}
              strokeWidth={0.35}
              opacity={edgeOpacity([a, b])}
              style={{ transition: 'opacity 0.25s, stroke 0.25s' }}
            />
          ))}

          {/* Nodes */}
          {NODES.map((node) => {
            const color  = CAT_COLOR[node.cat]
            const active = hovered === node.id
            const op     = nodeOpacity(node.id)
            return (
              <g
                key={node.id}
                opacity={op}
                style={{ transition: 'opacity 0.25s', cursor: 'default' }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Hover target where the bolt is drawn (the bolt itself is
                    in the canvas on top, which ignores the pointer) */}
                <circle cx={node.x} cy={node.y} r={3.5} fill="transparent" />
                {/* Label */}
                <text
                  x={node.x + node.tx}
                  y={node.y + node.ty}
                  textAnchor={node.anchor}
                  className="constellation__label"
                  fill={active ? color : 'var(--text-white)'}
                  style={{ transition: 'fill 0.2s' }}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </svg>
        <SkillBolts hovered={hovered} />
      </div>
    </div>
  )
}
