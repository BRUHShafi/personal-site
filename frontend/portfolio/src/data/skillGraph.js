// The Skills constellation: nodes, links between them, and category colours.
// Shared by the SVG (lines, labels, hover) and the 3D lightning bolts drawn
// on each node (SkillBolts).

// x/y are in the SVG's viewBox units (0 0 100 70). tx/ty offset the label.
export const NODES = [
  { id: 0, label: 'JavaScript',   x: 16, y: 10, cat: 'frontend', tx: -3, ty: -2,   anchor: 'end'    },
  { id: 1, label: 'React',        x: 30, y: 28, cat: 'frontend', tx: -3, ty: -2,   anchor: 'end'    },
  { id: 2, label: 'HTML & CSS',   x: 9,  y: 46, cat: 'frontend', tx:  3, ty:  0,   anchor: 'start'  },
  { id: 3, label: 'Python',       x: 56, y: 8,  cat: 'backend',  tx:  0, ty: -4,   anchor: 'middle' },
  { id: 4, label: 'AWS',          x: 72, y: 16, cat: 'tools',    tx:  3, ty: -2,   anchor: 'start'  },
  { id: 5, label: 'Node.js',      x: 76, y: 36, cat: 'backend',  tx:  3, ty:  0,   anchor: 'start'  },
  { id: 6, label: 'SQL',          x: 58, y: 54, cat: 'backend',  tx: -3, ty: -2,   anchor: 'end'    },
  { id: 7, label: 'REST APIs',    x: 84, y: 62, cat: 'backend',  tx:  3, ty:  0,   anchor: 'start'  },
  { id: 8, label: 'Git & GitHub', x: 42, y: 64, cat: 'tools',    tx:  0, ty:  6,   anchor: 'middle' },
  { id: 9, label: 'Blender',      x: 22, y: 64, cat: 'other',    tx:  0, ty:  6,   anchor: 'middle' },
]

export const EDGES = [
  [0, 1], [1, 2], [0, 2],               // frontend cluster
  [3, 4], [4, 5], [5, 7], [6, 7], [3, 6], // backend/cloud cluster
  [1, 3], [1, 8], [8, 6],               // bridges
  [9, 8],                                // Blender → Git (creative tools)
]

export const CAT_COLOR = {
  frontend: '#00e5ff',
  backend:  '#d946ef',
  tools:    '#ffaa00',
  other:    '#22c55e',
}
