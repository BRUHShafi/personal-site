import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

// Pays a canvas's one-off GPU costs right after it mounts, instead of on the
// first frame the sword is actually visible.
//
// Three.js compiles shaders lazily — on the first render that draws a material.
// Our canvases mount paused (frameloop 'never') while the user rests on the
// previous section, then start rendering mid-scroll when the sword flies in.
// That first render was a ~40–100ms stall right in the middle of the glide.
//
// gl.compile() compiles every material in the scene, even ones outside the
// camera's view (a normal render skips frustum-culled objects, and the sword
// usually *is* off-frame at this point). advance() then runs one full frame —
// including the EffectComposer's Bloom passes — which works even while
// frameloop is 'never'. The sword is off-frame, so that frame draws nothing.
//
// Must sit inside <Canvas>, after the model (same Suspense boundary, so this
// effect only runs once the model has loaded).
export default function CanvasWarmup() {
  const get = useThree((s) => s.get)

  useEffect(() => {
    const { gl, scene, camera, advance } = get()
    gl.compile(scene, camera)
    advance(performance.now())
  }, [get])

  return null
}
