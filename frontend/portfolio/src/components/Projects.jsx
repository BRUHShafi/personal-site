import { useScrollReveal } from '../hooks/useScrollReveal'
import './Projects.css'

// Replace these with your actual projects
const projects = [
  {
    number: '01',
    title: 'Project One',
    description:
      'A short description of what this project does, what problem it solves, and what you learned building it.',
    tags: ['React', 'JavaScript'],
    link: '#', // replace with your project URL or GitHub link
  },
  {
    number: '02',
    title: 'Project Two',
    description:
      'A short description of what this project does, what problem it solves, and what you learned building it.',
    tags: ['Python', 'SQL'],
    link: '#',
  },
  {
    number: '03',
    title: 'Project Three',
    description:
      'A short description of what this project does, what problem it solves, and what you learned building it.',
    tags: ['Node.js', 'REST API'],
    link: '#',
  },
]

function ProjectCard({ project, flipped }) {
  const ref = useScrollReveal()

  return (
    <article className={`project-card reveal ${flipped ? 'project-card--flipped' : ''}`} ref={ref}>
      {/* Image placeholder */}
      <div className="project-card__image">
        <span className="project-card__image-label">Project Screenshot</span>
      </div>

      {/* Text content */}
      <div className="project-card__content">
        <span className="project-card__number">{project.number} —</span>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__desc">{project.description}</p>
        <div className="project-card__tags">
          {project.tags.map((tag) => (
            <span key={tag} className="project-card__tag">{tag}</span>
          ))}
        </div>
        <a href={project.link} className="project-card__link" target="_blank" rel="noopener noreferrer">
          View Project →
        </a>
      </div>
    </article>
  )
}

export default function Projects() {
  return (
    <section className="projects" id="work">
      <div className="projects__header">
        <p className="section-label">04 // Artifacts</p>
        <h2 className="section-heading">Selected<br />Works.</h2>
      </div>

      <div className="projects__list">
        {projects.map((project, i) => (
          <ProjectCard key={project.number} project={project} flipped={i % 2 !== 0} />
        ))}
      </div>
    </section>
  )
}
