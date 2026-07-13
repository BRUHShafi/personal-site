import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer__logo">Shafi</span>

      <span className="footer__copy">© 2026 All rights reserved.</span>

      <nav className="footer__links" aria-label="Social links">
        <a href="https://github.com/BRUHShafi" target="_blank" rel="noopener noreferrer">GitHub</a>
        {/* TODO: replace with your real LinkedIn profile URL */}
        <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:shafi12mrmr@gmail.com">Email</a>
      </nav>
    </footer>
  )
}
