import { useState, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './Interests.css'

const STATUS_LABELS = {
  ongoing:    'PLAYING',
  completed:  'COMPLETED',
  'will-play': 'WILL PLAY LATER',
  reading:    'READING',
  'want-to-read': 'WANT TO READ',
  current:    'CURRENT',
  past:       'PAST',
}

const cards = [
  {
    id: 'playing',
    label: '02 // Playing',
    title: 'Currently Playing',
    preview: 'Elden Ring',
    accent: 'var(--cyan)',
    items: [
      { name: 'Elden Ring',  sub: 'FromSoftware',  status: 'ongoing' },
      { name: 'Valorant',    sub: 'Riot Games',     status: 'ongoing' },
      { name: 'FIFA 25',     sub: 'EA Sports',      status: 'completed' },
      { name: 'GTA V',       sub: 'Rockstar Games', status: 'completed' },
      { name: 'Minecraft',   sub: 'Mojang',         status: 'will-play' },
    ],
  },
  {
    id: 'reading',
    label: '02 // Reading',
    title: 'Currently Reading',
    preview: 'Atomic Habits',
    accent: 'var(--magenta)',
    items: [
      { name: 'Atomic Habits',          sub: 'James Clear',    status: 'reading' },
      { name: 'Dune',                   sub: 'Frank Herbert',  status: 'reading' },
      { name: 'The Pragmatic Programmer', sub: 'Hunt & Thomas', status: 'completed' },
      { name: 'Clean Code',             sub: 'Robert Martin',  status: 'completed' },
      { name: 'Deep Work',              sub: 'Cal Newport',    status: 'want-to-read' },
    ],
  },
  {
    id: 'working',
    label: '02 // Working',
    title: 'Currently Working At',
    preview: 'Acme Corp',
    accent: 'var(--green)',
    items: [
      { name: 'Acme Corp',   sub: 'Software Developer', status: 'current' },
      { name: 'Freelance',   sub: 'Web Projects',       status: 'current' },
      { name: 'University',  sub: 'CS Student',         status: 'past' },
    ],
  },
]

function StatusBadge({ status }) {
  return (
    <span className={`interest-badge interest-badge--${status}`}>
      {STATUS_LABELS[status] ?? status.toUpperCase()}
    </span>
  )
}

function InterestModal({ card, onClose }) {
  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="interest-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="interest-modal" style={{ '--accent': card.accent }}>
        {/* Modal header */}
        <div className="interest-modal__header">
          <p className="interest-modal__label">{card.label}</p>
          <h3 className="interest-modal__title">{card.title}</h3>
        </div>

        {/* Scrollable list */}
        <div className="interest-modal__list">
          {card.items.map((item, i) => (
            <div key={i} className="interest-modal__item">
              <div className="interest-modal__item-index">{String(i + 1).padStart(2, '0')}</div>
              <div className="interest-modal__item-info">
                <span className="interest-modal__item-name">{item.name}</span>
                <span className="interest-modal__item-sub">{item.sub}</span>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>

        {/* Close button — centered at bottom */}
        <div className="interest-modal__footer">
          <button className="interest-modal__close" onClick={onClose}>
            ✕ &nbsp;close
          </button>
        </div>
      </div>
    </div>
  )
}

function InterestCard({ card }) {
  const [open, setOpen] = useState(false)
  const ref = useScrollReveal()

  return (
    <>
      <button
        className="interest-card reveal"
        ref={ref}
        style={{ '--accent': card.accent }}
        onClick={() => setOpen(true)}
      >
        <p className="interest-card__label">{card.label}</p>
        <p className="interest-card__title">{card.title}</p>
        <p className="interest-card__preview">{card.preview}</p>
        <span className="interest-card__cta">View all →</span>
      </button>

      {open && <InterestModal card={card} onClose={() => setOpen(false)} />}
    </>
  )
}

export default function Interests() {
  const headerRef = useScrollReveal()

  return (
    <section className="interests" id="interests">
      <div className="interests__inner">
        <div className="interests__header reveal" ref={headerRef}>
          <p className="section-label">02 // Now</p>
          <h2 className="section-heading">What I'm up to.</h2>
        </div>

        <div className="interests__grid">
          {cards.map((card) => (
            <InterestCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
