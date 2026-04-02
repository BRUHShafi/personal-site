import { useState, useEffect, useRef } from 'react'
import './Navbar.css'

const NAV_ITEMS = [
  { label: 'Intro',   href: '#intro' },
  { label: 'Skills',  href: '#skills' },
  { label: 'Work',    href: '#work' },
  { label: 'Resume',  href: '#resume' },
  { label: 'Contact', href: '#contact' },
  { label: '☀ Light', toggle: true },   // theme toggle — no href
]

const RADIUS = 158
const START_ANGLE = 195
const END_ANGLE   = 345

function getPos(index, total) {
  const angle = START_ANGLE + (index / (total - 1)) * (END_ANGLE - START_ANGLE)
  const rad = (angle * Math.PI) / 180
  return {
    x: Math.cos(rad) * RADIUS,
    y: -Math.sin(rad) * RADIUS,
  }
}

export default function Navbar() {
  const [open, setOpen]       = useState(false)
  const [light, setLight]     = useState(() => {
    return localStorage.getItem('theme') === 'light'
  })
  const navRef = useRef(null)

  // Apply theme to <html> and persist
  useEffect(() => {
    const root = document.documentElement
    if (light) {
      root.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    } else {
      root.removeAttribute('data-theme')
      localStorage.setItem('theme', 'dark')
    }
  }, [light])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleItemClick = (e, item) => {
    e.preventDefault()
    if (item.toggle) {
      setLight(prev => !prev)
      // keep menu open so user can see the label change
      return
    }
    setOpen(false)
    const el = document.querySelector(item.href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  // Update toggle label based on current state
  const items = NAV_ITEMS.map(item =>
    item.toggle ? { ...item, label: light ? '☾ Dark' : '☀ Light' } : item
  )

  return (
    <nav
      className={`orbital-nav ${open ? 'orbital-nav--open' : ''}`}
      ref={navRef}
      aria-label="Main navigation"
    >
      <div className="orbital-nav__ring" aria-hidden="true" />

      {items.map((item, i) => {
        const { x, y } = getPos(i, items.length)
        return (
          <a
            key={item.label}
            href={item.href ?? '#'}
            className={`orbital-nav__item${item.toggle ? ' orbital-nav__item--toggle' : ''}`}
            style={{
              '--tx': `${x}px`,
              '--ty': `${y}px`,
              transitionDelay: open
                ? `${i * 0.045}s`
                : `${(items.length - 1 - i) * 0.03}s`,
            }}
            onClick={(e) => handleItemClick(e, item)}
            tabIndex={open ? 0 : -1}
          >
            <span className="orbital-nav__label">{item.label}</span>
          </a>
        )
      })}

      <button
        className="orbital-nav__center"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle navigation"
      >
        <span className="orbital-nav__name">Shafi</span>
      </button>
    </nav>
  )
}
