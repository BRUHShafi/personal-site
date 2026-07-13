import { useEffect, useRef } from 'react'

// Marks a full-viewport snap panel as 'is-active' while it fills the screen.
//
// This is the sibling of useScrollReveal, with one key difference: it toggles
// the class instead of unobserving after the first hit. That means a panel's
// contents re-animate every time you scroll back to it, which is the whole
// point of the snap layout — each section should feel like a fresh page.
export function useSnapPanel(threshold = 0.4) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-active', entry.isIntersecting),
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
