import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { projects } from '../data/projects'
import Navbar from '../components/Navbar'
import SceneBackground from '../components/SceneBackground'
import FloatingOrbs from '../components/FloatingOrbs'
import './ProjectsPage.css'

const STATUS_LABEL = {
  'in-progress': 'In Progress',
  'completed':   'Completed',
  'archived':    'Archived',
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <SceneBackground />
      <FloatingOrbs accent="var(--green)" />
      <Navbar mode="interest" />
      <div className="pp-wrap">

        <header className="pp-header">
          <p className="pp-label">03 // Projects</p>
          <h1 className="pp-title">What I'm Building</h1>
          <p className="pp-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} documented</p>
        </header>

        <div className="pp-grid">
          {projects.map(p => (
            <button
              key={p.id}
              className="pp-card"
              onClick={() => navigate(`/projects/${p.id}`)}
              style={{ '--card-accent': p.accent }}
            >
              {/* Cover image or placeholder */}
              <div className="pp-card-cover">
                {p.cover
                  ? <img src={p.cover} alt={p.title} />
                  : <span className="pp-card-cover__placeholder">{p.title[0]}</span>
                }
              </div>

              <div className="pp-card-body">
                <div className="pp-card-top">
                  <span className={`pp-card-status pp-card-status--${p.status}`}>
                    {STATUS_LABEL[p.status] ?? p.status}
                  </span>
                  <span className="pp-card-year">{p.year}</span>
                </div>

                <h2 className="pp-card-title">{p.title}</h2>
                <p className="pp-card-tagline">{p.tagline}</p>

                <div className="pp-card-tech">
                  {p.tech.slice(0, 4).map(t => (
                    <span key={t} className="pp-card-tag">{t}</span>
                  ))}
                  {p.tech.length > 4 && (
                    <span className="pp-card-tag pp-card-tag--more">+{p.tech.length - 4}</span>
                  )}
                </div>
              </div>

              <span className="pp-card-arrow">→</span>
            </button>
          ))}
        </div>

      </div>
    </>
  )
}
