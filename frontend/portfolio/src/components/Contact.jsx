import { useRef, useState } from 'react'
import { useSnapPanel } from '../hooks/useSnapPanel'
import ContactPillars from './ContactPillars'
import './Contact.css'

export default function Contact() {
  const panelRef = useSnapPanel()
  const cardRef = useRef()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // No backend yet, so hand the message off to the visitor's own mail client.
    // This actually delivers — nothing here claims to send on its own.
    const subject = `Portfolio inquiry from ${form.name}`
    const body = `${form.message}\n\n— ${form.name} (${form.email})`
    window.location.href =
      `mailto:shafi12mrmr@gmail.com?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <section className="contact snap-panel" id="contact" ref={panelRef}>
      <ContactPillars cardRef={cardRef} />
      <div className="contact__card reveal" ref={cardRef}>
        <div className="contact__header">
          <p className="section-label">05 // Contact</p>
          {/* label sequence: About 01, Interests 02, Skills 03, Résumé 04, Contact 05 */}
          <h2 className="contact__heading">
            Ready to<br /><em>Collaborate?</em>
          </h2>
          <p className="contact__subtext">
            Have a project in mind, a question, or just want to connect?
            Drop me a message below.
          </p>
        </div>

        {sent ? (
          <div className="contact__success">
            Your email app just opened with the message ready — hit send and
            I'll get back to you soon.
          </div>
        ) : (
          <form className="contact__form" onSubmit={handleSubmit}>
            <div className="contact__row">
              <label className="contact__field">
                <span className="contact__label">Name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="contact__field">
                <span className="contact__label">Email</span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </label>
            </div>

            <label className="contact__field">
              <span className="contact__label">Message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="What's on your mind?"
                rows={5}
                required
              />
            </label>

            <button type="submit" className="contact__submit">
              Launch Inquiry →
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
