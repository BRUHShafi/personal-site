import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEMES } from '../data/themes'
import { useTheme } from '../context/ThemeContext'
import './Navbar.css'

const NAV_ITEMS = [
  { label: 'Intro',   href: '#intro' },
  { label: 'Skills',  href: '#skills' },
  { label: 'Work',    route: '/projects' },
  { label: 'Resume',  href: '#resume' },
  { label: 'Contact', href: '#contact' },
  { label: '🎨 Theme', palette: true },
]

// Shown instead of NAV_ITEMS when on an interest detail page
const INTEREST_ITEMS = [
  { label: '← Back',    back: true },
  { label: '⌕ Search',  search: true },
  { label: '🎨 Theme',  palette: true },
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
  const navigate                  = useNavigate()
  const { theme, setTheme }       = useTheme()
  const [open, setOpen]           = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [dimmed, setDimmed]       = useState(false)
  const navRef    = useRef(null)
  const centerRef = useRef(null)
  const diskRef   = useRef(null)

  // Accretion-disk spin driven by scroll velocity: it idles at a slow drift,
  // whips up in the scroll direction while you scroll, then eases back to idle.
  // Scrolling up spins it the other way. Rotation is written to a CSS var so
  // the disk's ::before (the glowing matter) can read it.
  useEffect(() => {
    const disk = diskRef.current
    if (!disk) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const IDLE   = 36      // deg/sec — the resting drift (~10s per turn)
    const K       = 1.6    // deg/sec added per pixel scrolled
    const MAX_VEL = 240    // cap kept LOW so the spin stays trackable, not a blur
    const DECAY   = 2.2    // how quickly velocity relaxes back toward IDLE

    let angle    = 0
    let vel      = IDLE
    let lastY    = window.scrollY
    let lastT    = performance.now()
    let raf      = 0

    const onScroll = () => {
      const y  = window.scrollY
      vel = Math.max(-MAX_VEL, Math.min(MAX_VEL, vel + (y - lastY) * K))
      lastY = y
    }

    const frame = (t) => {
      const dt = Math.min(0.05, (t - lastT) / 1000)   // clamp long gaps
      lastT = t
      angle += vel * dt
      vel   += (IDLE - vel) * Math.min(1, dt * DECAY) // relax back to idle
      disk.style.setProperty('--disk-angle', `${angle}deg`)
      raf = requestAnimationFrame(frame)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(frame)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  // Close the theme palette whenever the nav closes
  useEffect(() => {
    if (!open) setPaletteOpen(false)
  }, [open])

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

    // Coalesce to one hit-test per frame — check() runs 9 elementsFromPoint calls
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => { ticking = false; check() })
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    check()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleItemClick = (e, item) => {
    e.preventDefault()
    if (item.palette) {
      setPaletteOpen(prev => !prev)
      return
    }
    if (item.route) {
      setOpen(false)
      navigate(item.route)
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
    if (!el) return
    // Prefer the home page's glide (same pace as the wheel); fall back to the
    // browser's smooth scroll where it isn't running (touch, reduced motion)
    const handled = !window.dispatchEvent(
      new CustomEvent('snapscroll:to', { detail: { el }, cancelable: true })
    )
    if (!handled) el.scrollIntoView({ behavior: 'smooth' })
  }

  const items = mode === 'interest' ? INTEREST_ITEMS : NAV_ITEMS

  return (
    <nav
      className={`orbital-nav ${open ? 'orbital-nav--open' : ''}`}
      ref={navRef}
      aria-label="Main navigation"
      style={{ opacity: dimmed && !open ? 0.25 : 1, transition: 'opacity 0.5s ease' }}
    >
      <div className="orbital-nav__ring" aria-hidden="true" />
      <span className="orbital-nav__disk" aria-hidden="true" ref={diskRef} />

      {items.map((item, i) => {
        const { x, y } = getPos(i, items.length)
        return (
          <a
            key={item.label}
            href={item.href ?? '#'}
            className={`orbital-nav__item${item.palette ? ' orbital-nav__item--toggle' : ''}${(item.search && searchActive) || (item.palette && paletteOpen) ? ' orbital-nav__item--active' : ''}`}
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

      <div
        className={`theme-palette${paletteOpen ? ' theme-palette--open' : ''}`}
        role="menu"
        aria-label="Theme picker"
      >
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="menuitemradio"
            aria-checked={theme === t.id}
            aria-label={t.name}
            className={`theme-swatch${theme === t.id ? ' theme-swatch--active' : ''}`}
            onClick={() => { setTheme(t.id); setOpen(false) }}
            tabIndex={paletteOpen ? 0 : -1}
          >
            <span
              className="theme-swatch__dot"
              style={{ background: t.swatch, color: t.swatch }}
            />
            <span className="theme-swatch__name">{t.name}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
