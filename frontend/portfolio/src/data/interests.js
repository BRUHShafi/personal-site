// ─────────────────────────────────────────────
//  INTERESTS DATA
//  Game covers pulled from Steam CDN (portrait 600×900).
//  Book covers pulled from Open Library by ISBN.
//  cover: null  → no thumbnail shown.
//  favourite: true  → appears in ★ Fav filter.
//  status: 'playing' → appears in Playing filter (set these yourself).
// ─────────────────────────────────────────────

const steam = (id) =>
  `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/library_600x900.jpg`

const steamFallback = (id) =>
  `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/header.jpg`

const book = (isbn) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`

const g = (id, name, sub, opts = {}) => ({
  name, sub,
  favourite: false,
  cover: steam(id),
  coverfallback: steamFallback(id),
  ...opts,
})

export const interestCards = [
  {
    id: 'playing',
    label: '02 // Playing',
    title: 'Currently Playing',
    image: '/Game_Card.gif',
    accent: 'var(--cyan)',
    glow: 'rgba(0, 229, 255, 0.18)',
    filterLabels: {
      playing: 'PLAYING',
    },
    items: [
      // ── Tell me which are favourite: true and status: 'playing' ──

      // From your Steam library screenshots
      g(393380,  'Brawlhalla',                    'Ubisoft'),
      g(386360,  'SMITE',                         'Hi-Rez Studios'),
      g(379720,  'DOOM',                          'id Software'),
      g(848450,  'Subnautica: Below Zero',        'Unknown Worlds Entertainment'),
      g(22380,   'Fallout: New Vegas',            'Obsidian Entertainment'),
      g(1623730, 'Palworld',                      'Pocketpair'),
      g(3590,    'Plants vs. Zombies GOTY',       'PopCap Games'),
      g(359550,  'Rainbow Six Siege',             'Ubisoft Montreal'),
      { name: 'Dispatch', sub: 'Adhoc Studio', favourite: false, cover: null },
      g(377160,  'Fallout 4',                     'Bethesda Game Studios'),
      g(203160,  'Tomb Raider',                   'Crystal Dynamics'),
      g(218620,  'Payday 2',                      'Overkill Software'),
      g(1145360, 'Hades',                         'Supergiant Games'),
      g(250330,  'The Wolf Among Us',             'Telltale Games'),
      g(1172470, 'Apex Legends',                  'Respawn Entertainment'),
      g(409710,  'BioShock Remastered',           'Irrational Games'),
      g(275850,  'No Man\'s Sky',                 'Hello Games'),
      g(208650,  'Batman: Arkham Knight',         'Rocksteady Studios', { favourite: true, status: 'playing' }),
      g(239160,  'Thief',                         'Eidos-Montréal'),
      g(264710,  'Subnautica',                    'Unknown Worlds Entertainment', { favourite: true }),
      g(1326470, 'Sons of the Forest',            'Endnight Games'),
      g(265630,  'Fistful of Frags',              'Fistful of Frags Team'),
      g(1211740, 'Muck',                          'dani'),
      g(1046930, 'Dota Underlords',               'Valve'),
      g(292030,  'The Witcher 3: Wild Hunt',      'CD Projekt Red'),
      g(601510,  'Yu-Gi-Oh! Duel Links',          'Konami'),
      g(1145350, 'Hades II',                      'Supergiant Games'),
      g(238070,  'Shadow Warrior',                'Flying Wild Hog'),
      g(49520,   'Borderlands 2',                 'Gearbox Software'),
      g(1043810, 'Spellbreak',                    'Proletariat Inc.'),
      g(356190,  'Middle-earth: Shadow of War',   'Monolith Productions'),
      g(8190,    'Just Cause 2',                  'Avalanche Studios'),
      g(627690,  'Injustice 2',                   'NetherRealm Studios'),
      g(1404210, 'MultiVersus',                   'Player First Games'),
      g(236390,  'War Thunder',                   'Gaijin Entertainment'),
      g(475150,  'Titan Quest Anniversary Ed.',   'THQ Nordic'),
      g(630100,  'Soulworker',                    'Lion Games'),
      g(1568590, 'Goose Goose Duck',              'Gaggle Studios'),
      g(1337010, 'Alba: A Wildlife Adventure',    'ustwo games'),
      g(364470,  'The Elder Scrolls: Legends',    'Sparkypants Studios'),
      g(2073850, 'The Finals',                    'Embark Studios'),
      g(346110,  'ARK: Survival Evolved',         'Studio Wildcard'),
      g(700330,  'SCP: Secret Laboratory',        'Northwood Studios'),
      g(252490,  'Rust',                          'Facepunch Studios'),
      { name: 'Gwent: The Witcher Card Game', sub: 'CD Projekt Red', favourite: false, cover: null },

      // From your existing list
      g(730,     'Counter-Strike 2',              'Valve',           { status: 'playing' }),
      g(230410,  'Warframe',                      'Digital Extremes'),
      g(306130,  'The Elder Scrolls Online',      'ZeniMax Online Studios'),
      g(2694490, 'Path of Exile 2',               'Grinding Gear Games'),
      g(2767030, 'Marvel Rivals',                 'NetEase Games'),
      g(444090,  'Paladins',                      'Hi-Rez Studios'),
      g(429120,  'AdventureQuest 3D',             'Artix Entertainment'),
      g(1086940, "Baldur's Gate 3",               'Larian Studios',   { favourite: true }),
      g(489830,  'The Elder Scrolls V: Skyrim',   'Bethesda Game Studios', { favourite: true }),
      g(105600,  'Terraria',                      'Re-Logic'),
      g(413150,  'Stardew Valley',                'ConcernedApe'),
      g(202170,  'Sleeping Dogs',                 'United Front Games'),
      g(933480,  'Enderal: Forgotten Stories',    'SureAI'),
      g(2679560, 'Clair Obscur: Expedition 33',   'Sandfall Interactive', { favourite: true }),

      // From your manual list
      g(1091500, 'Cyberpunk 2077',                'CD Projekt Red'),
      g(570940,  'Dark Souls: Remastered',        'FromSoftware',     { favourite: true }),
      g(335300,  'Dark Souls II: Scholar of the First Sin', 'FromSoftware', { favourite: true }),
      g(374320,  'Dark Souls III',                'FromSoftware',     { favourite: true }),
      g(1245620, 'Elden Ring',                    'FromSoftware'),
      g(814380,  'Sekiro: Shadows Die Twice',     'FromSoftware'),
      g(1551360, 'Forza Horizon 5',               'Playground Games'),
      { name: 'League of Legends', sub: 'Riot Games',  favourite: false, cover: null },
      { name: 'Valorant',          sub: 'Riot Games',  favourite: false, cover: null },
    ],
  },
  {
    id: 'reading',
    label: '02 // Reading',
    title: 'Currently Reading',
    image: '/Book_Card.gif',
    accent: 'var(--magenta)',
    glow: 'rgba(217, 70, 239, 0.18)',
    filterLabels: {
      reading:   'READING',
      completed: 'COMPLETED',
    },
    items: [
      { name: 'Atomic Habits',            sub: 'James Clear',   status: 'reading',   favourite: false, cover: book('9780735211292') },
      { name: 'Dune',                     sub: 'Frank Herbert', status: 'reading',   favourite: false, cover: book('9780441013593') },
      { name: 'The Pragmatic Programmer', sub: 'Hunt & Thomas', status: 'completed', favourite: false, cover: book('9780135957059') },
      { name: 'Clean Code',               sub: 'Robert Martin', status: 'completed', favourite: false, cover: book('9780132350884') },
    ],
  },
  {
    id: 'working',
    label: '02 // Working',
    title: 'Currently Working At',
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
