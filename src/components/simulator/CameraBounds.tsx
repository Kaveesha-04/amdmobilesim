import { useFrame } from '@react-three/fiber'
import { clampToHall } from '../../config/hall'
import type { CameraZoom } from '../../stores/cameraZoom'
import type { OrbitControlsLike } from './CameraZoomRig'

/**
 * Keeps the orbit camera inside the hall. It runs after OrbitControls has moved the
 * camera, and OrbitControls starts from wherever the camera is on the next frame, so
 * the two agree. The follow camera does its own limiting.
 */
export function CameraBounds({ zoom }: { zoom: CameraZoom }) {
  useFrame(({ camera, controls, invalidate }) => {
    const orbit = controls as unknown as OrbitControlsLike | null
    if (!orbit?.enabled || !clampToHall(camera.position)) return

    // Stop any zoom that was heading past the walls, so it doesn't keep pushing against them.
    zoom.handOverToOrbit()
    invalidate()
  })

  return null
}
