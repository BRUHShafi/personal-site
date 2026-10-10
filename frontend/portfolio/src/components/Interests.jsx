import { useNavigate } from 'react-router-dom'
import { useSnapPanel } from '../hooks/useSnapPanel'
import { useTilt } from '../hooks/useTilt'
import { interestCards } from '../data/interests'
import { topPlayed } from '../data/steamMerge'
import { STEAM_PROFILE_URL } from '../data/steamProfile'
import './Interests.css'

// Official Steam mark, inlined so the tile needs no network request and
// recolours with currentColor.
const STEAM_PATH =
  'M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z'

/* ── Tile 1: the full games list ── */
function InterestCard({ card }) {
  const navigate = useNavigate()
  // The reveal is driven by the parent snap panel, so the card only needs tilt.
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(8)

  return (
    <button
      className="interest-card reveal"
      ref={tiltRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        '--accent': card.accent,
        '--card-image': `url(${card.image})`,
        '--card-bg-size': card.bgSize ?? 'cover',
        '--card-glow': card.glow,
      }}
      onClick={() => navigate(card.route ?? `/interests/${card.id}`)}
    >
      <p className="interest-card__title">{card.title}</p>
      <span className="interest-card__cta">View all →</span>
    </button>
  )
}

/* ── Tile 2: the top three right now ── */
function TopGamesCard({ card }) {
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(8)
  const top = topPlayed(card.items, 3)

  return (
    <div
      className="now-tile now-tile--top reveal"
      ref={tiltRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ '--accent': card.accent, '--card-glow': card.glow }}
    >
      <p className="now-tile__label">Top 3 right now</p>

      <ul className="top3">
        {top.map((game, i) => (
          <li className="top3__row" key={game.appid ?? game.name}>
            <span className="top3__rank">{i + 1}</span>

            {game.cover ? (
              <img
                className="top3__cover"
                src={game.cover}
                alt=""
                loading="lazy"
                onError={(e) => {
                  if (game.coverfallback && e.target.src !== game.coverfallback) {
                    e.target.src = game.coverfallback
                  } else {
                    e.target.style.visibility = 'hidden'
                  }
                }}
              />
            ) : (
              <span className="top3__cover top3__cover--empty" aria-hidden="true" />
            )}

            <span className="top3__meta">
              <span className="top3__name">{game.name}</span>
              {game.sub && <span className="top3__sub">{game.sub}</span>}
            </span>

            {/* playtime only exists once the Steam sync has run */}
            {game.playtime && <span className="top3__time">{game.playtime}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ── Tile 3: link out to the Steam profile (not a tab) ── */
function SteamTile() {
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useTilt(8)

  return (
    <a
      className="now-tile now-tile--steam reveal"
      ref={tiltRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      href={STEAM_PROFILE_URL}
      target="_blank"
      // noopener/noreferrer: without these the opened tab gets a handle back to
      // this page via window.opener and could navigate it elsewhere.
      rel="noopener noreferrer"
      aria-label="Open my Steam profile in a new tab"
    >
      <svg className="now-tile__steam-mark" viewBox="0 0 24 24" aria-hidden="true">
        <path d={STEAM_PATH} fill="currentColor" />
      </svg>
      <span className="now-tile__steam-cta">My Steam profile ↗</span>
    </a>
  )
}

export default function Interests() {
  const panelRef = useSnapPanel()
  const playing = interestCards.find((c) => c.id === 'playing')

  if (!playing) return null

  return (
    <section className="interests snap-panel" id="interests" ref={panelRef}>
      <div className="interests__inner">
        <div className="interests__header reveal">
          <p className="section-label">02 // Now</p>
          <h2 className="section-heading">What I&apos;m playing.</h2>
        </div>

        <div className="interests__grid">
          <InterestCard card={playing} />
          <TopGamesCard card={playing} />
          <SteamTile />
        </div>
      </div>
    </section>
  )
}
