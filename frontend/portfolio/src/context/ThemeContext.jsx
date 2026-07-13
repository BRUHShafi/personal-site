import { createContext, useContext, useState, useEffect } from 'react'
import { THEMES, DEFAULT_THEME } from '../data/themes'

// Global theme state. The picker (Navbar) writes it; the background (SceneBackground)
// and any component reads it. Applies data-theme on <html> and persists to localStorage.
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme')
    return THEMES.some(t => t.id === stored) ? stored : DEFAULT_THEME
  })

  useEffect(() => {
    const root = document.documentElement
    // Blackhole is the default look (the :root tokens) — no attribute needed.
    if (theme === DEFAULT_THEME) root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
