import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import type { Vector3Tuple } from 'three'
import type { CameraPreset } from '../../config/camera'
import { DRONE_CENTRE_HEIGHT } from '../../config/world'

interface SceneCameraProps {
  preset: CameraPreset
  /** The drone's position. The camera orbits the centre of the model. */
  dronePosition: Vector3Tuple
}

export function SceneCamera({ preset, dronePosition }: SceneCameraProps) {
  const [x, y, z] = dronePosition
  const focusY = y + DRONE_CENTRE_HEIGHT
  const [offsetX, offsetY, offsetZ] = preset.offset

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={preset.fov}
        near={0.05}
        far={2500}
        position={[x + offsetX, focusY + offsetY, z + offsetZ]}
      />
      {/* Panning would move the orbit centre, which could take the camera below the
          ground. With it off, stopping at the horizontal keeps the camera above the
          drone's centre, and so above the ground. */}
      <OrbitControls
        makeDefault
        target={[x, focusY, z]}
        enablePan={false}
        dampingFactor={0.08}
        minDistance={preset.minDistance}
        maxDistance={preset.maxDistance}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}
