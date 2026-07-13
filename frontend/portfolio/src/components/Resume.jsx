import { useSnapPanel } from '../hooks/useSnapPanel'
import './Resume.css'

export default function Resume() {
  const panelRef = useSnapPanel()

  return (
    <section className="resume snap-panel" id="resume" ref={panelRef}>
      <div className="resume__inner reveal">
        <div className="resume__left">
          <p className="section-label">05 // Résumé</p>
          <h2 className="section-heading">My<br />Experience.</h2>
        </div>

        <div className="resume__right">
          {/* Add your experience entries here */}
          <div className="resume__entry reveal reveal-delay-1">
            <span className="resume__year">2024 — Present</span>
            <div>
              <h3 className="resume__role">Your Role</h3>
              <span className="resume__company">Company / School</span>
              <p className="resume__detail">
                Brief description of what you did or are doing here.
              </p>
            </div>
          </div>

          <div className="resume__entry reveal reveal-delay-2">
            <span className="resume__year">2023 — 2024</span>
            <div>
              <h3 className="resume__role">Previous Role</h3>
              <span className="resume__company">Company / School</span>
              <p className="resume__detail">
                Brief description of what you did here.
              </p>
            </div>
          </div>

          {/* Download button — replace href with the path to your resume PDF */}
          <a href="/resume.pdf" className="resume__download" download>
            Download Full Résumé ↓
          </a>
        </div>
      </div>
    </section>
  )
}
