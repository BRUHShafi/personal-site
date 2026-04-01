import { useScrollReveal } from '../hooks/useScrollReveal'
import './Interests.css'

const cards = [
  {
    id: 'gen',
    title: 'Generative Aesthetics',
    desc: 'Exploring the boundaries where algorithms meet human emotion in visual art.',
  },
  {
    id: 'cyber',
    title: 'Cybernetics',
    desc: '',
  },
  {
    id: 'brutal',
    title: 'Brutalism',
    desc: 'Architectural honesty through raw digital materials.',
  },
  {
    id: 'data',
    title: 'Data Sculpture',
    desc: '',
  },
]

function InterestCard({ card, delay }) {
  const ref = useScrollReveal()
  return (
    <div
      className={`interests__card interests__card--${card.id} reveal`}
      ref={ref}
      style={{ transitionDelay: delay }}
    >
      <div className="interests__card-overlay" />
      <div className="interests__card-content">
        <h3 className="interests__card-title">{card.title}</h3>
        {card.desc && <p className="interests__card-desc">{card.desc}</p>}
      </div>
    </div>
  )
}

export default function Interests() {
  const headerRef = useScrollReveal()

  return (
    <section className="interests" id="interests">
      <div className="interests__header reveal" ref={headerRef}>
        <p className="section-label">02 // Curations</p>
        <h2 className="section-heading">Creative Interests.</h2>
      </div>

      <div className="interests__grid">
        <InterestCard card={cards[0]} delay="0s" />
        <InterestCard card={cards[1]} delay="0.1s" />
        <InterestCard card={cards[2]} delay="0.2s" />
        <InterestCard card={cards[3]} delay="0.15s" />
      </div>
    </section>
  )
}
