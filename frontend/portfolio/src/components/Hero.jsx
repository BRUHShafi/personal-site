import { useState, useEffect } from 'react'
import SwordCanvas from './Sword'
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

function BouncingName({ name }) {
  const words = name.split(' ')
  let globalIndex = 0

  return (
    <h1 className="hero__name" aria-label={name}>
      {words.map((word, wordIndex) => {
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
      })}
    </h1>
  )
}

export default function Hero() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollProgress(Math.min(window.scrollY / window.innerHeight, 1))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="hero" id="intro">
      <div className="hero__sword-overlay">
        <SwordCanvas scrollProgress={scrollProgress} />
      </div>
      <div className="hero__left">
        <BouncingName name="MD Mushfiqur Rahman" />
        <TypingSubtitle />
      </div>
    </section>
  )
}
