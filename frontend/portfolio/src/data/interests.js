// ─────────────────────────────────────────────
//  INTERESTS DATA
//  Edit this file to update your cards.
//  Images go in: public/images/games|books|work/
//  Leave image as null to show a colored placeholder.
// ─────────────────────────────────────────────

export const interestCards = [
  {
    id: 'playing',
    label: '02 // Playing',
    title: 'Currently Playing',
    preview: 'Elden Ring',
    image: '/Game_Card.gif',
    accent: 'var(--cyan)',
    glow: 'rgba(0, 229, 255, 0.18)',
    filterLabels: {
      ongoing:   'PLAYING',
      online:    'ONLINE',
      completed: 'COMPLETED',
    },
    items: [
      { name: 'Counter-Strike 2',                  sub: 'Valve',                  status: 'ongoing'   },
      { name: 'Warframe',                          sub: 'Digital Extremes',        status: 'online'    },
      { name: 'The Elder Scrolls Online',          sub: 'Bethesda Softworks',      status: 'online'    },
      { name: 'Path of Exile',                     sub: 'Grinding Gear Games',     status: 'online'    },
      { name: 'Marvel Rivals',                     sub: 'NetEase Games',           status: 'online'    },
      { name: 'Paladins',                          sub: 'Hi-Rez Studios',          status: 'online'    },
      { name: 'AdventureQuest 3D',                 sub: 'Artix Entertainment',     status: 'online'    },
      { name: 'The Elder Scrolls V: Skyrim',       sub: 'Bethesda Softworks',      status: 'completed' },
      { name: "Baldur's Gate 3",                   sub: 'Larian Studios',          status: 'completed' },
      { name: 'Terraria',                          sub: 'Re-Logic',                status: 'completed' },
      { name: 'Stardew Valley',                    sub: 'ConcernedApe',            status: 'completed' },
      { name: 'Sleeping Dogs: Definitive Edition', sub: 'Square Enix',             status: 'completed' },
      { name: 'Enderal: Forgotten Stories',        sub: 'SureAI',                  status: 'completed' },
      { name: 'Clair Obscur: Expedition 33',       sub: 'Sandfall Interactive',    status: 'completed' },
    ],
  },
  {
    id: 'reading',
    label: '02 // Reading',
    title: 'Currently Reading',
    preview: 'Atomic Habits',
    image: '/Book_Card.gif',
    accent: 'var(--magenta)',
    glow: 'rgba(217, 70, 239, 0.18)',
    filterLabels: {
      reading:   'READING',
      completed: 'COMPLETED',
    },
    items: [
      { name: 'Atomic Habits',            sub: 'James Clear',   status: 'reading'   },
      { name: 'Dune',                     sub: 'Frank Herbert', status: 'reading'   },
      { name: 'The Pragmatic Programmer', sub: 'Hunt & Thomas', status: 'completed' },
      { name: 'Clean Code',               sub: 'Robert Martin', status: 'completed' },
    ],
  },
  {
    id: 'working',
    label: '02 // Working',
    title: 'Currently Working At',
    preview: 'Acme Corp',
    image: '/Job_Card.gif',
    accent: 'var(--green)',
    glow: 'rgba(34, 197, 94, 0.18)',
    filterLabels: {
      current: 'CURRENT',
      past:    'PAST',
    },
    items: [
      { name: 'Acme Corp',  sub: 'Software Developer', status: 'current', favourite: true  },
      { name: 'Freelance',  sub: 'Web Projects',       status: 'current', favourite: false },
      { name: 'University', sub: 'CS Student',         status: 'past',    favourite: false },
    ],
  },
]
