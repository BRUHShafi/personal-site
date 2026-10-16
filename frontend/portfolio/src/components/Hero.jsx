import { useRef, useState, useEffect } from 'react'
import SwordCanvas from './Sword'
import { useSnapPanel } from '../hooks/useSnapPanel'
import { tipScreenY, progressForTipAt, FULLY_IN_AT, STAGE_EXIT_SHIFT } from './heroSwordConfig'
import './Hero.css'

const TITLES = [
  'Cybersecurity Student',
  'Cloud Computing Enthusiast',
  'Networking & Infrastructure',
  'Building Secure Systems',
]

const TYPE_SPEED   = 60    // ms per character when typing
const DELETE_SPEED = 35    // ms per character when deleting
const PAUSE_END    = 2800  // ms to wait at the end before deleting
const PAUSE_START  = 400   // ms to wait before typing next string

function TypingSubtitle() {
  const [displayed,   setDisplayed]   = useState('')
  const [titleIndex,  setTitleIndex]  = useState(0)
  const [isDeleting,  setIsDeleting]  = useState(false)

  useEffect(() => {
    const current = TITLES[titleIndex]
    let timeout

    if (!isDeleting) {
      if (displayed.length < current.length) {
        // Still typing
        timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), TYPE_SPEED)
      } else {
        // Finished typing — wait then start deleting
        timeout = setTimeout(() => setIsDeleting(true), PAUSE_END)
      }
    } else {
      if (displayed.length > 0) {
        // Still deleting
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), DELETE_SPEED)
      } else {
        // Finished deleting — wait then move to next title
        timeout = setTimeout(() => {
          setTitleIndex((prev) => (prev + 1) % TITLES.length)
          setIsDeleting(false)
        }, PAUSE_START)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, titleIndex])

  return (
    <p className="hero__subtitle">
      {displayed}
      <span className="hero__cursor" aria-hidden="true">|</span>
    </p>
  )
}

// The wave of bouncing letters. Rendered twice by SplitName (once per half),
// with identical delays so the two copies stay perfectly in sync.
function NameLetters({ name }) {
  const words = name.split(' ')
  let globalIndex = 0

  return words.map((word, wordIndex) => {
    const wordStart = globalIndex
    globalIndex += word.length
    return (
      <span key={wordIndex} className="hero__name-word">
        {word.split('').map((char, charIndex) => (
          <span
            key={charIndex}
            className="hero__name-letter"
            style={{ animationDelay: `${(wordStart + charIndex) * 0.065}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    )
  })
}

// The name, pre-cut down the middle. Two stacked copies — the left one is
// clipped to the left half, the right one to the right half — so at rest they
// read as one name, and on scroll they slide apart along the sword's line.
// The driving values (--cut, --spread, --slash-opacity) are CSS variables
// written straight onto the stage by Hero's scroll handler — no re-renders.
// (React 19: `ref` arrives as a normal prop — no forwardRef needed.)
function SplitName({ name, ref }) {
  return (
    <h1 className="hero__name" aria-label={name} ref={ref}>
      <span className="hero__name-half hero__name-half--left">
        <NameLetters name={name} />
      </span>
      <span className="hero__name-half hero__name-half--right" aria-hidden="true">
        <NameLetters name={name} />
      </span>
      <span className="hero__slash" aria-hidden="true" />
    </h1>
  )
}

// While the blade is inside the name, the halves only crack open by this much
// (px) — the split should *follow* the blade, not run ahead of it.
const CRACK_PX = 10
// After the tip clears the top, the halves drift apart and fade over the rest
// of the hero scroll, finishing at this progress. Closer to 1 = lingers longer.
const FLY_OUT_END = 0.9
// How far each half drifts by the end, as a fraction of viewport width
const FLY_OUT_DISTANCE = 0.45
// Hero <-> About glide length (ms). Every other glide uses useSnapScroll's DURATION.
const HERO_GLIDE_MS = 2400

const clamp01 = (x) => Math.min(1, Math.max(0, x))
// Even drift: eases in and out, no burst at the start
const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

export default function Hero() {
  const panelRef = useSnapPanel()
  const stageRef = useRef()
  const nameRef = useRef()
  const scrollProgressRef = useRef(0)

  useEffect(() => {
    // The name sits in a fixed stage, so its box only changes on resize —
    // measure it then, not on every scroll (reading layout mid-scroll is slow).
    let nameRect = nameRef.current.getBoundingClientRect()

    const update = () => {
      const vpH = window.innerHeight
      const progress = Math.min(window.scrollY / vpH, 1)
      scrollProgressRef.current = progress

      // How far the blade tip has pushed up through the name:
      // 0 = tip still below it, 1 = tip has cleared the top
      const tipY = tipScreenY(progress, vpH)
      const passed = nameRect.bottom - tipY                       // px above the name's bottom edge
      const cut = clamp01(passed / nameRect.height)
      // Phase 2 starts only when the blade has gone all the way through, then
      // runs on scroll progress so the halves stay visible for most of the glide
      const pClear = progressForTipAt(nameRect.top, vpH)
      const flyOutT = clamp01((progress - pClear) / Math.max(0.01, FLY_OUT_END - pClear))
      const flyOut = easeInOutQuad(flyOutT)

      const stage = stageRef.current.style
      stage.setProperty('--cut', cut.toFixed(3))
      const spreadPx = cut * CRACK_PX + flyOut * window.innerWidth * FLY_OUT_DISTANCE
      stage.setProperty('--spread', `${spreadPx.toFixed(1)}px`)
      // Slash flares while cutting, fades as the halves fly apart
      stage.setProperty('--slash-opacity', (passed > 0 ? 1 - flyOut : 0).toFixed(3))
      stage.setProperty('--hero-fade', (1 - clamp01(progress * 4)).toFixed(3))
      // Halves fade during the last stretch of their drift
      stage.setProperty('--name-opacity', (1 - clamp01((flyOutT - 0.5) / 0.5)).toFixed(3))
      // Once the sword is fully inside the portal, slide the whole stage up
      // and off the top, so the (still open) portal leaves with the hero
      // instead of vanishing when the stage is hidden at progress 1
      const exit = clamp01((progress - FULLY_IN_AT) / (1 - FULLY_IN_AT))
      stage.transform = exit > 0 ? `translateY(${(-exit * STAGE_EXIT_SHIFT * vpH).toFixed(1)}px)` : ''
      // Fully scrolled past → take the fixed stage out of the way entirely
      stage.visibility = progress >= 1 ? 'hidden' : 'visible'
    }

    const onResize = () => {
      nameRect = nameRef.current.getBoundingClientRect()
      update()
    }

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', onResize)
    // Fonts load after first paint and change the name's size
    document.fonts?.ready.then(onResize)
    update()
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // The section itself is just a 100vh snap stop. Everything you see lives in
  // .hero__stage, which is position: fixed — it stays pinned while the page
  // scrolls, so the split plays out in place while About rises in beneath it.
  return (
    <section className="hero snap-panel" id="intro" ref={panelRef} data-glide-ms={HERO_GLIDE_MS}>
      <div className="hero__stage" ref={stageRef}>
        <div className="hero__sword-overlay">
          <SwordCanvas scrollProgressRef={scrollProgressRef} />
        </div>
        <div className="hero__content">
          <SplitName name="MD Mushfiqur Rahman" ref={nameRef} />
          <TypingSubtitle />
        </div>
      </div>
    </section>
  )
}
