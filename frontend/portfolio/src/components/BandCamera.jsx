import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'

// Lets a canvas cover only a horizontal band of its section while the camera
// still frames the whole section — so the sword lands at exactly the same spot
// and size it would on a full-section canvas.
//
// Why: a canvas costs roughly per pixel (render + Bloom + MSAA all run over
// every pixel, empty sky included). The flyby/spin swords only ever move
// through a thin band, so a full-section canvas wasted most of its work.
//
// How: camera.setViewOffset() renders one window of a larger virtual view.
// The virtual view is the full section; the window is our band.
//
// top / height are fractions of the section's height, and must match the
// band <div>'s CSS (top: top*100%, height: height*100%).
export default function BandCamera({ top, height }) {
  // Three.js objects are meant to be mutated; R3F's get() hands back live state
  // without React treating the camera as an immutable hook value.
  const get  = useThree((s) => s.get)
  const size = useThree((s) => s.size)

  useLayoutEffect(() => {
    const { camera } = get()
    // Tell R3F not to reset aspect on resize — we own the projection now
    camera.manual = true

    const fullW = size.width
    const fullH = size.height / height
    camera.aspect = fullW / fullH
    camera.setViewOffset(fullW, fullH, 0, top * fullH, size.width, size.height)
    camera.updateProjectionMatrix()
  }, [get, size, top, height])

  return null
}
