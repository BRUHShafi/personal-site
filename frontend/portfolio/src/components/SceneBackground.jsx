import { useTheme } from '../context/ThemeContext'
import StarField from './StarField'
import SynthwaveScene from './scenes/SynthwaveScene'

// Renders the active theme's animated background. Only one scene is mounted at a
// time (the others unmount), so just one canvas/RAF loop runs — no extra cost.
export default function SceneBackground() {
  const { theme } = useTheme()

  switch (theme) {
    case 'synthwave':
      return <SynthwaveScene />
    case 'light':       // Whitehole — StarField recolors itself in light mode
    case 'blackhole':
    default:
      return <StarField />
  }
}
