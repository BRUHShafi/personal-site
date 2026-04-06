import { useScrollReveal } from '../hooks/useScrollReveal'
import SwordFlyby from './SwordFlyby'
import './About.css'

export default function About() {
  const ref = useScrollReveal()

  return (
    <section className="about" id="intro-section" style={{ position: 'relative' }}>
      <SwordFlyby />
      <div className="about__inner reveal" ref={ref}>
        {/* Left column — label + big heading */}
        <div className="about__left">
          <p className="section-label">01 // The Essence</p>
          <h2 className="about__heading">
            A little bit<br />
            about <em>me.</em>
          </h2>
        </div>

        {/* Right column — bio + info cards */}
        <div className="about__right">
          <p className="about__bio">
            {/* Replace this with your own introduction */}
            I'm a developer passionate about building clean, functional, and
            meaningful digital experiences. I care about the details — the
            code that works, the design that feels right, and the projects
            that make an impact.
          </p>

          <div className="about__cards">
            <div className="about__card reveal reveal-delay-1">
              <span className="about__card-title">Focus</span>
              <span className="about__card-text">
                {/* e.g. "Full-stack web development" */}
                Web Development
              </span>
            </div>
            <div className="about__card reveal reveal-delay-2">
              <span className="about__card-title" style={{ color: 'var(--magenta)' }}>Currently</span>
              <span className="about__card-text">
                {/* e.g. "Open to opportunities" */}
                Building cool things
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
