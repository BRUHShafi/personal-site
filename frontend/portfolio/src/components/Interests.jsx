import { useState, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useTilt } from '../hooks/useTilt'
import { interestCards } from '../data/interests'
import './Interests.css'

const STATUS_LABELS = {
  ongoing:        'PLAYING',
  completed:      'COMPLETED',
  'will-play':    'WILL PLAY LATER',
  reading:        'READING',
  'want-to-read': 'WANT TO READ',
  current:        'CURRENT',
  past:           'PAST',
}

function StatusBadge({ status }) {
  return (
    <span className={`interest-badge interest-badge--${status}`}>
      {STATUS_LABELS[status] ?? status.toUpperCase()}
    </span>
  )
}


function InterestModal({ card, onClose }) {
  const [filter, setFilter] = useState('all')

  // Build filter options from the items in this card
  const statuses = [...new Set(card.items.map(i => i.status))]
  const filters = [
    { key: 'all',       label: 'All' },
    ...statuses.map(s => ({ key: s, label: card.filterLabels?.[s] ?? s.toUpperCase() })),
    { key: 'favourite', label: '★ Fav' },
  ]

  const visible = card.items.filter(item => {
    if (filter === 'all')       return true
    if (filter === 'favourite') return item.favourite
    return item.status === filter
  })

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll
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

        {/* Header */}
        <div className="interest-modal__header">
          <p className="interest-modal__label">{card.label}</p>
          <h3 className="interest-modal__title">{card.title}</h3>
        </div>

        {/* Filter pills */}
        <div className="interest-modal__filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={`interest-filter ${filter === f.key ? 'interest-filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Scrollable list */}
        <div className="interest-modal__list">
          {visible.length === 0 && (
            <p className="interest-modal__empty">Nothing here yet.</p>
          )}
          {visible.map((item, i) => (
            <div key={i} className="interest-modal__item">
              <div className="interest-modal__item-info">
                <span className="interest-modal__item-name">
                  {item.name}
                  {item.favourite && <span className="interest-modal__star" title="Favourite"> ★</span>}
                </span>
                <span className="interest-modal__item-sub">{item.sub}</span>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>

        {/* Close button */}
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
  const scrollRef = useScrollReveal()
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(8)

  // Merge both refs onto the same element
  const setRef = (el) => {
    scrollRef.current = el
    tiltRef.current = el
  }

  return (
    <>
      <button
        className="interest-card reveal"
        ref={setRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{
          '--accent': card.accent,
          '--card-image': `url(${card.image})`,
          '--card-bg-size': card.bgSize ?? 'cover',
          '--card-glow': card.glow,
        }}
        onClick={() => setOpen(true)}
      >
        <p className="interest-card__title">{card.title}</p>
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
          {interestCards.map((card) => (
            <InterestCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}
