import { useNavigate } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useTilt } from '../hooks/useTilt'
import { interestCards } from '../data/interests'
import './Interests.css'

function InterestCard({ card }) {
  const navigate  = useNavigate()
  const scrollRef = useScrollReveal()
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(8)

  const setRef = (el) => {
    scrollRef.current = el
    tiltRef.current = el
  }

  return (
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
      onClick={() => navigate(`/interests/${card.id}`)}
    >
      <p className="interest-card__title">{card.title}</p>
      <span className="interest-card__cta">View all →</span>
    </button>
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
