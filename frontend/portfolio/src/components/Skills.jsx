import { useScrollReveal } from '../hooks/useScrollReveal'
import SwordSpin from './SwordSpin'
import SkillConstellation from './SkillConstellation'
import './Skills.css'

// Replace these with your actual skills
const skills = [
  'JavaScript',
  'React',
  'Python',
  'HTML & CSS',
  'Git & GitHub',
  'Node.js',
  'SQL',
  'REST APIs',
]

export default function Skills() {
  const ref = useScrollReveal()

  return (
    <section className="skills" id="skills" style={{ position: 'relative' }}>
      <SwordSpin />
      <div className="skills__inner reveal" ref={ref} style={{ position: 'relative', zIndex: 2 }}>
        <div className="skills__left">
          <p className="section-label">03 // Toolkit</p>
          <h2 className="section-heading">Technical<br />Skills.</h2>
          <p className="skills__desc">
            {/* A short line about your toolkit */}
            The tools I use to build things.
          </p>
        </div>

        <div className="skills__right">
          <SkillConstellation />
        </div>
      </div>
    </section>
  )
}
