import { useState } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import './Contact.css'

export default function Contact() {
  const ref = useScrollReveal()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: wire up to an email service (e.g. EmailJS or Formspree)
    console.log('Form submitted:', form)
    setSent(true)
  }

  return (
    <section className="contact" id="contact">
      <div className="contact__card reveal" ref={ref}>
        <div className="contact__header">
          <p className="section-label">05 // Contact</p>
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
            Message sent — I'll get back to you soon.
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
