import { useNavigate } from 'react-router-dom'
import { useSnapPanel } from '../hooks/useSnapPanel'
import { useTilt } from '../hooks/useTilt'
import { interestCards } from '../data/interests'
import './Interests.css'

function InterestCard({ card }) {
  const navigate = useNavigate()
  // The reveal is driven by the parent snap panel, so the card only needs tilt.
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(8)

  return (
    <button
      className="interest-card reveal"
      ref={tiltRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        '--accent': card.accent,
        '--card-image': `url(${card.image})`,
        '--card-bg-size': card.bgSize ?? 'cover',
        '--card-glow': card.glow,
      }}
      onClick={() => navigate(card.route ?? `/interests/${card.id}`)}
    >
      <p className="interest-card__title">{card.title}</p>
      <span className="interest-card__cta">View all →</span>
    </button>
  )
}

export default function Interests() {
  const panelRef = useSnapPanel()

  return (
    <section className="interests snap-panel" id="interests" ref={panelRef}>
      <div className="interests__inner">
        <div className="interests__header reveal">
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
