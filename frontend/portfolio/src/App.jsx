import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StarField from './components/StarField'
import About from './components/About'
import Interests from './components/Interests'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Resume from './components/Resume'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <StarField />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Interests />
        <Skills />
        <Projects />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
