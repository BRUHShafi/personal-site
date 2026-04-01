import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer__logo">YOUR NAME</span>

      <span className="footer__copy">© 2025 All rights reserved.</span>

      <nav className="footer__links" aria-label="Social links">
        <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:you@email.com">Email</a>
      </nav>
    </footer>
  )
}
