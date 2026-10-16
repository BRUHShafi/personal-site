import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { interestCards } from '../data/interests'
import Navbar from '../components/Navbar'
import SceneBackground from '../components/SceneBackground'
import FloatingOrbs from '../components/FloatingOrbs'
import './InterestPage.css'

const STATUS_LABELS = {
  ongoing:   'Playing',
  completed: 'Completed',
  online:    'Online',
}

const CARD_NOUNS = {
  playing: 'game',
}

function StatusBadge({ status }) {
  if (!status) return null
  return (
    <span className={`ip-badge ip-badge--${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

// ── Toolbar options ──
// Hours buckets only apply to games Steam reports playtime for. Hand-added
// non-Steam games (Valorant, Elden Ring…) have no hours, so they only show
// under "Any hours".
const HOUR_BUCKETS = [
  { key: 'any',    label: 'Any hours' },
  { key: 'never',  label: 'Never played', test: m => m === 0 },
  { key: 'lt1',    label: 'Under 1h',     test: m => m > 0 && m < 60 },
  { key: '1-10',   label: '1–10h',        test: m => m >= 60 && m < 600 },
  { key: '10-100', label: '10–100h',      test: m => m >= 600 && m < 6000 },
  { key: '100+',   label: '100h+',        test: m => m >= 6000 },
]

const SORTS = [
  { key: 'default', label: 'My order' },
  { key: 'most',    label: 'Most played' },
  { key: 'least',   label: 'Least played' },
  { key: 'recent',  label: 'Recently played' },
  { key: 'twoweek', label: 'Last 2 weeks' },
  { key: 'az',      label: 'Name A–Z' },
  { key: 'za',      label: 'Name Z–A' },
]

// Steam lists software in the same library as games. Anything tagged only with
// these store genres (no game genre alongside) counts as software.
const SOFTWARE_GENRES = new Set([
  'Animation & Modeling', 'Audio Production', 'Design & Illustration',
  'Education', 'Game Development', 'Photo Editing', 'Software Training',
  'Utilities', 'Video Production', 'Web Publishing', 'Accounting',
])
const NEUTRAL_GENRES = new Set(['Early Access', 'Free To Play'])
const isSoftware = item => {
  const g = (item.genres ?? []).filter(x => !NEUTRAL_GENRES.has(x))
  return g.length > 0 && g.every(x => SOFTWARE_GENRES.has(x))
}

const TYPES = [
  { key: 'any',      label: 'Games + apps' },
  { key: 'games',    label: 'Games only' },
  { key: 'software', label: 'Apps only' },
]

const PLATFORMS = [
  { key: 'any',   label: 'All platforms' },
  { key: 'steam', label: 'Steam' },
  { key: 'other', label: 'Other' },
]

// Games with no Steam number sort last in either direction, so
// "Least played" isn't just a wall of non-Steam games.
const byNumber = (get, dir) => (a, b) => {
  const x = get(a), y = get(b)
  if (x == null && y == null) return 0
  if (x == null) return 1
  if (y == null) return -1
  return dir * (x - y)
}

const SORT_FNS = {
  most:    byNumber(i => i.playtimeMinutes, -1),
  least:   byNumber(i => i.playtimeMinutes || null, 1),
  recent:  byNumber(i => i.lastPlayed || null, -1),
  twoweek: byNumber(i => i.recentMinutes || null, -1),
  az:      (a, b) => a.name.localeCompare(b.name),
  za:      (a, b) => b.name.localeCompare(a.name),
}

export default function InterestPage() {
  const { id }        = useParams()
  const defaultFilter = 'all'
  const [filter, setFilter]           = useState(defaultFilter)
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort]               = useState('default')
  const [hours, setHours]             = useState('any')
  const [genre, setGenre]             = useState('any')
  const [platform, setPlatform]       = useState('any')
  const [type, setType]               = useState('any')
  const searchRef = useRef(null)

  // Always start at the top when entering this page
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // The search box is always visible now; the navbar's Search item just
  // jumps to it.
  const handleSearchToggle = () => {
    searchRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    searchRef.current?.focus({ preventScroll: true })
  }

  const resetFilters = () => {
    setFilter(defaultFilter)
    setSearchQuery('')
    setSort('default')
    setHours('any')
    setGenre('any')
    setPlatform('any')
    setType('any')
  }

  const card = interestCards.find(c => c.id === id)

  if (!card) {
    return (
      <>
        <SceneBackground />
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

  // Only offer filters the data can answer — before the first Steam sync
  // there is no playtime or genre, so those dropdowns stay hidden.
  const hasHours = card.items.some(i => i.playtimeMinutes != null)
  const genres   = [...new Set(card.items.flatMap(i => i.genres ?? []))].sort()
  const hasOther = card.items.some(i => !i.ownedOnSteam)
  const hasApps  = card.items.some(isSoftware)
  const bucket   = HOUR_BUCKETS.find(b => b.key === hours)
  const query    = searchQuery.trim().toLowerCase()

  const visible = card.items.filter(item => {
    const matchesTab = filter === 'all'       ? true
                     : filter === 'favourite' ? item.favourite
                     : item.status === filter
    const matchesSearch = !query
      || item.name.toLowerCase().includes(query)
      || item.sub?.toLowerCase().includes(query)
    const matchesHours = !bucket?.test
      || (item.playtimeMinutes != null && bucket.test(item.playtimeMinutes))
    const matchesGenre    = genre === 'any' || item.genres?.includes(genre)
    const matchesPlatform = platform === 'any'
      || (platform === 'steam' ? item.ownedOnSteam : !item.ownedOnSteam)
    const matchesType = type === 'any'
      || (type === 'software' ? isSoftware(item) : !isSoftware(item))
    return matchesTab && matchesSearch && matchesHours && matchesGenre
      && matchesPlatform && matchesType
  })
  if (SORT_FNS[sort]) visible.sort(SORT_FNS[sort])

  const isFiltered = filter !== defaultFilter || !!query || sort !== 'default'
    || hours !== 'any' || genre !== 'any' || platform !== 'any' || type !== 'any'

  const noun  = CARD_NOUNS[card.id] ?? 'item'
  const count = card.items.length

  return (
    <>
      <SceneBackground />
      <FloatingOrbs accent={card.accent} />
      <Navbar mode="interest" onSearch={handleSearchToggle} searchActive={!!query} />
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

        {/* Toolbar: search + sort + filters */}
        <div className="ip-toolbar">
          <div className="ip-search-bar">
            <span className="ip-search-bar__icon">⌕</span>
            <input
              ref={searchRef}
              className="ip-search-bar__input"
              type="text"
              placeholder={`Search ${noun}s or developers…`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setSearchQuery('')}
              aria-label={`Search ${noun}s`}
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

          <div className="ip-selects">
            <select className="ip-select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort">
              {SORTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            {hasHours && (
              <select className="ip-select" value={hours} onChange={e => setHours(e.target.value)} aria-label="Hours played">
                {HOUR_BUCKETS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            )}
            {genres.length > 0 && (
              <select className="ip-select" value={genre} onChange={e => setGenre(e.target.value)} aria-label="Genre">
                <option value="any">All genres</option>
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
            {hasApps && (
              <select className="ip-select" value={type} onChange={e => setType(e.target.value)} aria-label="Type">
                {TYPES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            )}
            {hasOther && (
              <select className="ip-select" value={platform} onChange={e => setPlatform(e.target.value)} aria-label="Platform">
                {PLATFORMS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="ip-result-row">
          <p className="ip-result-count">Showing {visible.length} of {count}</p>
          {isFiltered && (
            <button className="ip-reset" onClick={resetFilters}>Reset filters</button>
          )}
        </div>

        {/* List */}
        <div className="ip-list">
          {visible.length === 0 && isFiltered && (
            <div className="ip-no-results">
              <p className="ip-no-results__text">
                {query ? `No results for "${searchQuery}"` : 'No games match these filters'}
              </p>
              <p className="ip-no-results__hint">Try loosening a filter, or hit Reset</p>
            </div>
          )}
          {visible.length === 0 && !isFiltered && (
            <p className="ip-empty">Nothing here yet.</p>
          )}
          {visible.map((item, i) => (
            // Key on identity, not index: the list is filtered and searched, so
            // index keys let React reuse a row for a different game and briefly
            // show the previous game's cover art.
            <div key={item.appid ?? item.name} className="ip-item">
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
              {/* Populated by the Steam sync; absent until it has run. */}
              {item.playtime && <span className="ip-item-time">{item.playtime}</span>}
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
