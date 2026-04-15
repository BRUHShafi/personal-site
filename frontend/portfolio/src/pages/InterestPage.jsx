import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { interestCards } from '../data/interests'
import Navbar from '../components/Navbar'
import StarField from '../components/StarField'
import './InterestPage.css'

const STATUS_LABELS = {
  ongoing:   'Playing',
  completed: 'Completed',
  online:    'Online',
  reading:   'Reading',
  current:   'Current',
  past:      'Past',
}

const CARD_NOUNS = {
  playing: 'game',
  reading: 'book',
  working: 'position',
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`ip-badge ip-badge--${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function InterestPage() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const defaultFilter = id === 'playing' ? 'playing' : 'all'
  const [filter, setFilter]           = useState(defaultFilter)
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef(null)

  // Always start at the top when entering this page
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const handleSearchToggle = () => {
    setSearchOpen(prev => {
      if (prev) setSearchQuery('') // clear on close
      return !prev
    })
  }

  const card = interestCards.find(c => c.id === id)

  if (!card) {
    return (
      <>
        <StarField />
        <Navbar mode="interest" onSearch={handleSearchToggle} />
        <div className="ip-wrap">
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '80px' }}>Page not found.</p>
        </div>
      </>
    )
  }

  const statuses = [...new Set(card.items.map(i => i.status).filter(Boolean))]
  const hasFavs  = card.items.some(i => i.favourite)
  const filters  = [
    { key: 'all', label: 'All' },
    ...statuses.map(s => ({ key: s, label: card.filterLabels?.[s] ?? s.toUpperCase() })),
    ...(hasFavs ? [{ key: 'favourite', label: '★ Fav' }] : []),
  ]

  const visible = card.items.filter(item => {
    const matchesTab = filter === 'all'       ? true
                     : filter === 'favourite' ? item.favourite
                     : item.status === filter
    const matchesSearch = !searchQuery.trim()
      || item.name.toLowerCase().includes(searchQuery.toLowerCase())
      || item.sub?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const noun  = CARD_NOUNS[card.id] ?? 'item'
  const count = card.items.length

  return (
    <>
      <StarField />
      <Navbar mode="interest" onSearch={handleSearchToggle} searchActive={searchOpen} />
      <div className="ip-wrap" style={{ '--accent': card.accent, '--accent-glow': card.glow }}>

        {/* Header */}
        <header className="ip-header">
          <div className="ip-header-top">
            <div className="ip-header-left">
              <p className="ip-label">{card.label}</p>
              <h1 className="ip-title">{card.title}</h1>
            </div>

            {/* Steam connect — only on the playing card */}
            {card.id === 'playing' && (
              <div className="ip-connect">
                <p className="ip-connect__label">Get Connected</p>
                <a
                  href="https://steamcommunity.com/profiles/76561198411489517/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ip-connect__btn"
                  aria-label="Steam profile"
                >
                  <svg className="ip-connect__logo" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.044-4.527 4.555-4.527 2.512 0 4.555 2.032 4.555 4.527s-2.043 4.527-4.555 4.527h-.105l-4.076 2.483c0 .063.004.125.004.188 0 1.96-1.603 3.549-3.579 3.549-1.959 0-3.547-1.57-3.563-3.514L.022 14.978C.511 21.143 5.678 24 11.979 24 18.641 24 24 18.664 24 12S18.641 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.297-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012zm11.415-9.303c0-1.662-1.362-3.013-3.042-3.013-1.68 0-3.043 1.351-3.043 3.013 0 1.663 1.362 3.013 3.043 3.013 1.68 0 3.042-1.35 3.042-3.013zm-5.34-.002c0-1.252 1.03-2.267 2.3-2.267 1.269 0 2.298 1.015 2.298 2.267 0 1.252-1.029 2.268-2.299 2.268-1.269 0-2.3-1.016-2.3-2.268z"/>
                  </svg>
                  <span>Steam</span>
                </a>
              </div>
            )}
          </div>

          {/* Count + inline search bar */}
          <div className="ip-header-meta">
            <p className="ip-count">{count} {noun}{count !== 1 ? 's' : ''} tracked</p>

            {searchOpen && (
              <div className="ip-search-bar">
                <span className="ip-search-bar__icon">⌕</span>
                <input
                  ref={searchRef}
                  className="ip-search-bar__input"
                  type="text"
                  placeholder={`Search ${noun}s…`}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && handleSearchToggle()}
                />
                {searchQuery && (
                  <button
                    className="ip-search-bar__clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Filters */}
        <div className="ip-filters">
          {filters.map(f => (
            <button
              key={f.key}
              className={`ip-filter ${filter === f.key ? 'ip-filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="ip-list">
          {visible.length === 0 && searchQuery.trim() && (
            <div className="ip-no-results">
              <p className="ip-no-results__text">No results for "{searchQuery}"</p>
              <p className="ip-no-results__hint">Try a different name or developer</p>
            </div>
          )}
          {visible.length === 0 && !searchQuery.trim() && (
            <p className="ip-empty">Nothing here yet.</p>
          )}
          {visible.map((item, i) => (
            <div key={i} className="ip-item">
              <span className="ip-num">{String(i + 1).padStart(2, '0')}</span>
              {item.cover && (
                <img
                  className="ip-item-cover"
                  src={item.cover}
                  alt={item.name}
                  loading="lazy"
                  onError={e => {
                    // Fall back to Steam header art if portrait cover is missing
                    if (item.coverfallback && e.target.src !== item.coverfallback) {
                      e.target.src = item.coverfallback
                    } else {
                      e.target.style.display = 'none'
                    }
                  }}
                />
              )}
              <div className="ip-item-info">
                <span className="ip-item-name">
                  {item.name}
                  {item.favourite && <span className="ip-star">★</span>}
                </span>
                <span className="ip-item-sub">{item.sub}</span>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
