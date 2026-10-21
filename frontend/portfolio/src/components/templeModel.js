import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Shared loader for the marble + gold temple models (portal_gate.glb,
// pillar.glb). Returns the model ready to draw: meshes merged by material and
// materials tuned for our canvases. Used by <PortalGate> and <ContactPillars>.

// How strongly the marble + gold reflect the environment map. Without one,
// the metallic gold renders black and the marble looks flat.
const ENV_INTENSITY = 0.35

// The canvases' gold light rigs are tuned for a dark steel sword; on near-white
// marble they push it past Bloom's threshold and it glows like a lamp. Scaling
// the base colours down keeps the stone lit but below the glow.
const BRIGHTNESS = 0.35

// Per renderer: one env map + one built copy of each model, shared by every
// instance in that canvas (About has two gates, Contact two pillars). Keyed on
// the renderer because the env map is a GPU texture tied to it.
const builtFor = new WeakMap()

// A soft neutral studio env, generated locally (drei's <Environment preset>
// would fetch an HDR from a third-party CDN on every visit). Applied to these
// models' materials only — scene.environment would also relight the swords,
// which keep their gold light rig.
function buildEnvMap(gl) {
  const pmrem = new THREE.PMREMGenerator(gl)
  const room = new RoomEnvironment()
  const envMap = pmrem.fromScene(room, 0.04).texture
  room.dispose()
  pmrem.dispose()
  return envMap
}

// Baking each mesh's transform into its geometry and merging by material
// turns the gate's 12 meshes into 3 draw calls (the pillar's 2 stay 2).
function buildModel(cached, envMap, anchorName) {
  cached.updateWorldMatrix(true, true)

  // Optional reference point inside the model (the gate's opening centre).
  // The cached scene is never moved, so its world position is the model-space one.
  const anchor = new THREE.Vector3()
  if (anchorName) cached.getObjectByName(anchorName)?.getWorldPosition(anchor)

  const byMaterial = new Map()   // original material → [geometry in model space]
  cached.traverse((node) => {
    if (!node.isMesh || !node.material) return
    const geo = node.geometry.clone().applyMatrix4(node.matrixWorld)
    // Untextured materials, so only position + normal matter — and merging
    // needs every geometry to carry the same attributes (some meshes have UVs)
    for (const name of Object.keys(geo.attributes)) {
      if (name !== 'position' && name !== 'normal') geo.deleteAttribute(name)
    }
    if (!byMaterial.has(node.material)) byMaterial.set(node.material, [])
    byMaterial.get(node.material).push(geo)
  })

  const parts = []
  for (const [original, geos] of byMaterial) {
    // Own copy so the tweaks don't leak into the cached model
    const material = original.clone()
    material.color.multiplyScalar(BRIGHTNESS)
    material.envMap = envMap
    material.envMapIntensity = ENV_INTENSITY
    // If a future re-export can't merge (e.g. indexed + non-indexed mixed),
    // draw the pieces separately rather than not at all
    const merged = mergeGeometries(geos)
    if (merged) {
      geos.forEach((g) => g.dispose())
      parts.push({ geometry: merged, material })
    } else {
      geos.forEach((geometry) => parts.push({ geometry, material }))
    }
  }

  return { anchor, parts }
}

// → { anchor: Vector3, parts: [{ geometry, material }] }
export function useTempleModel(url, anchorName) {
  const { scene: cached } = useGLTF(url)
  const gl = useThree((s) => s.gl)

  return useMemo(() => {
    let perGl = builtFor.get(gl)
    if (!perGl) builtFor.set(gl, (perGl = { envMap: buildEnvMap(gl), models: new WeakMap() }))
    if (!perGl.models.has(cached)) perGl.models.set(cached, buildModel(cached, perGl.envMap, anchorName))
    return perGl.models.get(cached)
  }, [cached, gl, anchorName])
}
