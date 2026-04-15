import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

const NAV_ITEMS = [
  { label: 'Intro',   href: '#intro' },
  { label: 'Skills',  href: '#skills' },
  { label: 'Work',    href: '#work' },
  { label: 'Resume',  href: '#resume' },
  { label: 'Contact', href: '#contact' },
  { label: '☀ Light', toggle: true },
]

// Shown instead of NAV_ITEMS when on an interest detail page
const INTEREST_ITEMS = [
  { label: '← Back',    back: true },
  { label: '⌕ Search',  search: true },
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

export default function Navbar({ mode, onSearch, searchActive }) {
  const navigate               = useNavigate()
  const [open, setOpen]       = useState(false)
  const [light, setLight]     = useState(() => {
    return localStorage.getItem('theme') === 'light'
  })
  const [dimmed, setDimmed]   = useState(false)
  const navRef    = useRef(null)
  const centerRef = useRef(null)

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

  // Dim when floating over real content
  useEffect(() => {
    const SVG_VISUAL = new Set(['text','tspan','circle','ellipse','rect','path','line','polyline','polygon','image','use'])

    const isContentEl = (el, px, py) => {
      if (navRef.current?.contains(el) || el === navRef.current) return false
      if (el === document.body || el === document.documentElement) return false
      if (el.tagName === 'CANVAS') return false

      const tag = el.tagName.toLowerCase()
      if (SVG_VISUAL.has(tag))                                                    return true
      if (tag === 'img')                                                           return true
      if (['span','a','strong','em','input','textarea','button','label','li'].includes(tag)) return true

      // Block text: verify the rendered glyphs (not just layout box) cover this point
      if (['h1','h2','h3','h4','h5','h6','p'].includes(tag)) {
        try {
          const range = document.createRange()
          range.selectNodeContents(el)
          return Array.from(range.getClientRects()).some(
            r => px >= r.left && px <= r.right && py >= r.top && py <= r.bottom
          )
        } catch { return false }
      }

      // Containers: only flag if they have a visible card/image background
      const style    = window.getComputedStyle(el)
      const bg       = style.backgroundColor
      const bgImg    = style.backgroundImage
      const isPageBg = bg === 'rgba(0, 0, 0, 0)' || bg === 'rgb(7, 7, 15)' || bg === 'rgb(242, 242, 248)'
      return (!isPageBg) || (bgImg && bgImg !== 'none')
    }

    const check = () => {
      const btn = centerRef.current
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width  / 2
      const cy = rect.top  + rect.height / 2
      const r  = rect.width / 2 * 0.7   // sample radius — ~70% of button radius

      // Sample 9 points: center + 8 around the edge of the button
      const points = [
        [cx,      cy     ],
        [cx + r,  cy     ],
        [cx - r,  cy     ],
        [cx,      cy + r ],
        [cx,      cy - r ],
        [cx + r,  cy + r ],
        [cx - r,  cy - r ],
        [cx + r,  cy - r ],
        [cx - r,  cy + r ],
      ]

      const overContent = points.some(([px, py]) =>
        document.elementsFromPoint(px, py).some(el => isContentEl(el, px, py))
      )
      setDimmed(overContent)
    }

    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => window.removeEventListener('scroll', check)
  }, [])

  const handleItemClick = (e, item) => {
    e.preventDefault()
    if (item.toggle) {
      setLight(prev => !prev)
      return
    }
    if (item.back) {
      setOpen(false)
      if (window.history.length > 1) navigate(-1)
      else navigate('/')
      return
    }
    if (item.search) {
      setOpen(false)
      onSearch?.()
      return
    }
    setOpen(false)
    const el = document.querySelector(item.href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const baseItems = mode === 'interest' ? INTEREST_ITEMS : NAV_ITEMS
  const items = baseItems.map(item =>
    item.toggle ? { ...item, label: light ? '☾ Dark' : '☀ Light' } : item
  )

  return (
    <nav
      className={`orbital-nav ${open ? 'orbital-nav--open' : ''}`}
      ref={navRef}
      aria-label="Main navigation"
      style={{ opacity: dimmed && !open ? 0.25 : 1, transition: 'opacity 0.5s ease' }}
    >
      <div className="orbital-nav__ring" aria-hidden="true" />

      {items.map((item, i) => {
        const { x, y } = getPos(i, items.length)
        return (
          <a
            key={item.label}
            href={item.href ?? '#'}
            className={`orbital-nav__item${item.toggle ? ' orbital-nav__item--toggle' : ''}${item.search && searchActive ? ' orbital-nav__item--active' : ''}`}
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
        ref={centerRef}
      >
        <span className="orbital-nav__name">Shafi</span>
      </button>
    </nav>
  )
}
