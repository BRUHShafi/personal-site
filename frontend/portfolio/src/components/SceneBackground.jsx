import { useTheme } from '../context/ThemeContext'
import StarField from './StarField'
import SynthwaveScene from './scenes/SynthwaveScene'
import EmberScene from './scenes/EmberScene'
import OceanScene from './scenes/OceanScene'
import ForestScene from './scenes/ForestScene'

// Renders the active theme's animated background. Only one scene is mounted at a
// time (the others unmount), so just one canvas/RAF loop runs — no extra cost.
export default function SceneBackground() {
  const { theme } = useTheme()

  switch (theme) {
    case 'synthwave':
      return <SynthwaveScene />
    case 'ember':
      return <EmberScene />
    case 'ocean':
      return <OceanScene />
    case 'forest':
      return <ForestScene />
    case 'light':       // Whitehole — StarField recolors itself in light mode
    case 'blackhole':
    default:
      return <StarField />
  }
}
