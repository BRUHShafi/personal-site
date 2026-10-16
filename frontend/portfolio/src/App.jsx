import { useLayoutEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SceneBackground from './components/SceneBackground'
import { useSnapScroll } from './hooks/useSnapScroll'
import About from './components/About'
import Interests from './components/Interests'
import Skills from './components/Skills'
import Resume from './components/Resume'
import Contact from './components/Contact'
import Footer from './components/Footer'
import InterestPage from './pages/InterestPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

function HomePage() {
  // Scroll snapping is a home-page-only behaviour. The class lives on <html>
  // because that's the element that actually scrolls the document. It has to
  // land before the first paint — the sections' reveal animations are driven
  // by it, so a late class would flash their un-revealed state.
  useLayoutEffect(() => {
    document.documentElement.classList.add('snap')
    return () => document.documentElement.classList.remove('snap')
  }, [])

  // Slows the wheel glide to a deliberate pace. CSS snap stays underneath as
  // the fallback for touch, keyboard, and reduced-motion users.
  useSnapScroll()

  return (
    <>
      <SceneBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Interests />
        <Skills />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/interests/:id" element={<InterestPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
    </Routes>
  )
}

export default App
