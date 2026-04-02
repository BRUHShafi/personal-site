import { useState, useEffect } from 'react'
import './Navbar.css'

const navLinks = ['Intro', 'Skills', 'Work', 'Resume', 'Contact']

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <span className="navbar__logo">Shafi</span>

      <ul className="navbar__links">
        {navLinks.map((link) => (
          <li key={link}>
            <a href={`#${link.toLowerCase()}`}>{link}</a>
          </li>
        ))}
      </ul>

      <a href="#contact" className="navbar__cta">Connect</a>
    </nav>
  )
}
