import { useState, useEffect } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useTilt } from '../hooks/useTilt'
import { interestCards } from '../data/interests'
import './Interests.css'

const STATUS_LABELS = {
  ongoing:   'Playing',
  completed: 'Completed',
  online:    'Online',
  reading:   'Reading',
  current:   'Current',
  past:      'Past',
}

const CARD_NOUNS = {
  playing: 'game',
  reading: 'book',
  working: 'position',
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`interest-badge interest-badge--${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

function InterestModal({ card, onClose }) {
  const [filter, setFilter] = useState('all')

  const statuses = [...new Set(card.items.map(i => i.status))]
  const hasFavourites = card.items.some(i => i.favourite)
  const filters = [
    { key: 'all', label: 'All' },
    ...statuses.map(s => ({ key: s, label: card.filterLabels?.[s] ?? s.toUpperCase() })),
    ...(hasFavourites ? [{ key: 'favourite', label: '★ Fav' }] : []),
  ]

  const visible = card.items.filter(item => {
    if (filter === 'all')       return true
    if (filter === 'favourite') return item.favourite
    return item.status === filter
  })

  const noun  = CARD_NOUNS[card.id] ?? 'item'
  const count = card.items.length

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="interest-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="interest-modal" style={{ '--accent': card.accent, '--accent-glow': card.glow }}>

        {/* Corner close */}
        <button className="interest-modal__x" onClick={onClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className="interest-modal__header">
          <p className="interest-modal__label">{card.label}</p>
          <h3 className="interest-modal__title">{card.title}</h3>
          <p className="interest-modal__count">
            {count} {noun}{count !== 1 ? 's' : ''} tracked
          </p>
        </div>

        {/* Tab filters */}
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
              <span className="interest-modal__num">{String(i + 1).padStart(2, '0')}</span>
              <div className="interest-modal__item-info">
                <span className="interest-modal__item-name">
                  {item.name}
                  {item.favourite && <span className="interest-modal__star">★</span>}
                </span>
                <span className="interest-modal__item-sub">{item.sub}</span>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InterestCard({ card }) {
  const [open, setOpen] = useState(false)
  const scrollRef = useScrollReveal()
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(8)

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
