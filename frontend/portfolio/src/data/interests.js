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
      ongoing:    'PLAYING',
      completed:  'COMPLETED',
      'will-play': 'WILL PLAY LATER',
    },
    items: [
      { name: 'Elden Ring',  sub: 'FromSoftware',  status: 'ongoing',   favourite: true  },
      { name: 'Valorant',    sub: 'Riot Games',     status: 'ongoing',   favourite: false },
      { name: 'FIFA 25',     sub: 'EA Sports',      status: 'completed', favourite: false },
      { name: 'GTA V',       sub: 'Rockstar Games', status: 'completed', favourite: true  },
      { name: 'Minecraft',   sub: 'Mojang',         status: 'will-play', favourite: false },
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
      reading:        'READING',
      completed:      'COMPLETED',
      'want-to-read': 'WANT TO READ',
    },
    items: [
      { name: 'Atomic Habits',            sub: 'James Clear',   status: 'reading',      favourite: true  },
      { name: 'Dune',                     sub: 'Frank Herbert', status: 'reading',      favourite: false },
      { name: 'The Pragmatic Programmer', sub: 'Hunt & Thomas', status: 'completed',    favourite: true  },
      { name: 'Clean Code',               sub: 'Robert Martin', status: 'completed',    favourite: false },
      { name: 'Deep Work',                sub: 'Cal Newport',   status: 'want-to-read', favourite: false },
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
