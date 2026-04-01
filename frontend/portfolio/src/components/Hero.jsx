import './Hero.css'

// Split each letter of the name into its own span so we can animate them individually
function BouncingName({ name }) {
  return (
    <h1 className="hero__name" aria-label={name}>
      {name.split('').map((char, i) => (
        <span
          key={i}
          className="hero__name-letter"
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  )
}

export default function Hero() {
  return (
    <section className="hero" id="intro">
      {/* Left side — name + subtitle */}
      <div className="hero__left">
        <BouncingName name="YOUR NAME" />
        <p className="hero__subtitle">
          {/* Replace this with your title/tagline */}
          Software Developer &amp; Builder
        </p>
      </div>

      {/* Right side — placeholder for 3D throne */}
      <div className="hero__right">
        <div className="hero__throne-placeholder">
          <span className="hero__throne-label">THRONE PROTOCOL</span>
          <span className="hero__throne-sub">3D ASSET LOADING SEQUENCE INITIATED</span>
          <div className="hero__throne-bar">
            <div className="hero__throne-bar-fill" />
          </div>
        </div>
      </div>
    </section>
  )
}
