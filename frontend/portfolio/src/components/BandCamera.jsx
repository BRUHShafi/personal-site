import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'

// Lets a canvas cover only part of its section — a horizontal band, a vertical
// column, or both — while the camera still frames the whole section, so the
// sword lands at exactly the same spot and size it would on a full canvas.
//
// Why: a canvas costs roughly per pixel (render + Bloom + MSAA all run over
// every pixel, empty sky included). The swords only ever move through a thin
// band (flyby/spin) or a centre column (hero), so a full canvas wasted most of
// its work.
//
// How: camera.setViewOffset() renders one window of a larger virtual view.
// The virtual view is the full section; the window is our band/column.
//
// top / height / left / width are fractions of the section, and must match the
// canvas <div>'s CSS (top: top*100%, height: height*100%, same for left/width).
export default function BandCamera({ top = 0, height = 1, left = 0, width = 1 }) {
  // Three.js objects are meant to be mutated; R3F's get() hands back live state
  // without React treating the camera as an immutable hook value.
  const get  = useThree((s) => s.get)
  const size = useThree((s) => s.size)

  useLayoutEffect(() => {
    const { camera } = get()
    // Tell R3F not to reset aspect on resize — we own the projection now
    camera.manual = true

    const fullW = size.width / width
    const fullH = size.height / height
    camera.aspect = fullW / fullH
    camera.setViewOffset(fullW, fullH, left * fullW, top * fullH, size.width, size.height)
    camera.updateProjectionMatrix()
  }, [get, size, top, height, left, width])

  return null
}
