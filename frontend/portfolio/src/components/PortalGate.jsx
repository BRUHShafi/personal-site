import { useGLTF } from '@react-three/drei'
import { useTempleModel } from './templeModel'

// A Greek temple gate (Blender model) framing a portal. Drop it inside the
// same <Canvas> as the <Portal> it frames and give it the portal's position +
// rotation: the gate moves itself so its "PortalAnchor" node (the exact centre
// of its opening) lands on that point.
//
// Model units: floor top at y = 0, opening 6 wide × 9.24 tall, anchor at
// (0, 4.62, 0), steps face +Z — the same way a <Portal>'s opening faces.
// Materials + merging live in templeModel.js (shared with the Contact pillars).

const MODEL_URL = '/portal_gate.glb'

export default function PortalGate({ position, rotation, scale }) {
  const { anchor, parts } = useTempleModel(MODEL_URL, 'PortalAnchor')

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group position={[-anchor.x, -anchor.y, -anchor.z]}>
        {parts.map(({ geometry, material }) => (
          <mesh key={geometry.uuid} geometry={geometry} material={material} />
        ))}
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_URL)
