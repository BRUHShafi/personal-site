// ─────────────────────────────────────────────
//  PROJECTS DATA
//  Add a new object to the array for each project.
//  images: [] — array of paths under /public/projects/<id>/
//  video:  null | 'https://youtube.com/embed/...'  (embed URL)
//  demo:   null | 'https://...'
// ─────────────────────────────────────────────

export const projects = [
  {
    id:       'personal-site',
    title:    'Personal Portfolio Site',
    tagline:  'Custom-built portfolio with 3D, WebGL, and a deep-space aesthetic',
    status:   'in-progress',
    year:     '2025',
    tech:     ['React 19', 'Vite', 'Three.js', 'React Router', 'CSS'],
    accent:   '#00e5ff',
    cover:    null,

    description:
      'A fully custom personal portfolio and project showcase built from scratch. ' +
      'The goal was to learn modern web development end-to-end — from React fundamentals ' +
      'to deploying a production site — while building something that actually looks unique.',

    whatIDid: [
      'Built the entire frontend from scratch using React 19 + Vite',
      'Designed an orbital radial navigation system animated in pure CSS',
      'Integrated Three.js (via @react-three/fiber) for a 3D sword model with warm bloom post-processing',
      'Built a canvas star field with 280 twinkling stars and 7 decorative galaxies',
      'Created a physics-based floating orb system with elastic collision detection using requestAnimationFrame',
      'Implemented react-router-dom for interest detail pages with real-time search and tab filtering',
      'Set up a Git + GitHub workflow with branching, PRs, and a dev → main merge process',
    ],

    images:  [],
    github:  'https://github.com/BRUHShafi/personal-site',
    demo:    null,
    video:   null,
  },
]
