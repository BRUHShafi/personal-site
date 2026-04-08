import { useState } from 'react'
import './SkillConstellation.css'

// ── Node positions (x/y as % of viewBox 0 0 100 70) ─────────────────────────
const NODES = [
  { id: 0, label: 'JavaScript',   x: 16, y: 10, cat: 'frontend', tx: -3, ty: -2,   anchor: 'end'    },
  { id: 1, label: 'React',        x: 30, y: 28, cat: 'frontend', tx: -3, ty: -2,   anchor: 'end'    },
  { id: 2, label: 'HTML & CSS',   x: 9,  y: 46, cat: 'frontend', tx:  3, ty:  0,   anchor: 'start'  },
  { id: 3, label: 'Python',       x: 56, y: 8,  cat: 'backend',  tx:  0, ty: -3,   anchor: 'middle' },
  { id: 4, label: 'AWS',          x: 72, y: 16, cat: 'tools',    tx:  3, ty: -2,   anchor: 'start'  },
  { id: 5, label: 'Node.js',      x: 76, y: 36, cat: 'backend',  tx:  3, ty:  0,   anchor: 'start'  },
  { id: 6, label: 'SQL',          x: 58, y: 54, cat: 'backend',  tx: -3, ty: -2,   anchor: 'end'    },
  { id: 7, label: 'REST APIs',    x: 84, y: 62, cat: 'backend',  tx:  3, ty:  0,   anchor: 'start'  },
  { id: 8, label: 'Git & GitHub', x: 42, y: 64, cat: 'tools',    tx:  0, ty:  5,   anchor: 'middle' },
  { id: 9, label: 'Blender',      x: 22, y: 64, cat: 'other',    tx:  0, ty:  5,   anchor: 'middle' },
]

const EDGES = [
  [0, 1], [1, 2], [0, 2],               // frontend cluster
  [3, 4], [4, 5], [5, 7], [6, 7], [3, 6], // backend/cloud cluster
  [1, 3], [1, 8], [8, 6],               // bridges
  [9, 8],                                // Blender → Git (creative tools)
]

const CAT_COLOR = {
  frontend: '#00e5ff',
  backend:  '#d946ef',
  tools:    '#ffaa00',
  other:    '#22c55e',
}

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
            <span className="constellation__legend-dot" style={{ background: color }} />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </span>
        ))}
      </div>

      <svg
        className="constellation__svg"
        viewBox="0 0 100 70"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {Object.entries(CAT_COLOR).map(([cat, color]) => (
            <filter key={cat} id={`glow-${cat}`} x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.0" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

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
              {/* Outer pulse ring */}
              <circle
                cx={node.x} cy={node.y}
                r={active ? 3.5 : 2.8}
                fill="none"
                stroke={color}
                strokeWidth={0.4}
                opacity={active ? 0.7 : 0.4}
                className="constellation__ring"
                style={{ transition: 'r 0.2s, opacity 0.2s' }}
              />
              {/* Core dot */}
              <circle
                cx={node.x} cy={node.y}
                r={active ? 1.8 : 1.3}
                fill={color}
                filter={`url(#glow-${node.cat})`}
                className="constellation__dot"
                style={{ transition: 'r 0.2s' }}
              />
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
    </div>
  )
}
