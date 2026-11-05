import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import { FOLLOW_CAMERA } from '../../config/flight'
import { DRONE_CENTRE_HEIGHT } from '../../config/world'
import type { CameraZoom } from '../../stores/cameraZoom'
import type { FlightStore } from '../../stores/flightStore'
import type { OrbitControlsLike } from './CameraZoomRig'

/** A longer gap than this between frames still only moves the camera this far, so it can't jump. */
const MAX_FRAME_SECONDS = 0.05
const SETTLED_DISTANCE = 0.002

/**
 * Trails behind the drone's heading while the follow camera is on, and hands over
 * to the scene's OrbitControls while it's off. Each picks up from where the other
 * left the camera. Heading alone sets the place to follow, so tilting the drone
 * doesn't swing the camera about.
 *
 * The zoom sets how far back it trails. With the follow camera off, the free camera
 * stays where it was left as the drone flies away, so zooming first turns it back to
 * the drone.
 */
export function FollowCamera({ store, zoom }: { store: FlightStore; zoom: CameraZoom }) {
  const [state] = useState(() => ({
    isFollowing: false,
    lookTarget: new Vector3(),
    desiredPosition: new Vector3(),
    droneCentre: new Vector3(),
    fromDrone: new Vector3(),
  }))

  useFrame(({ camera, controls, invalidate }, delta) => {
    const orbit = controls as unknown as OrbitControlsLike | null
    if (!orbit) return

    const shouldFollow = store.getCameraMode() === 'follow'

    if (shouldFollow !== state.isFollowing) {
      state.isFollowing = shouldFollow
      orbit.enabled = !shouldFollow
      if (shouldFollow) {
        state.lookTarget.copy(orbit.target)
      } else {
        orbit.target.copy(state.lookTarget)
      }
    }

    const seconds = Math.min(delta, MAX_FRAME_SECONDS)
    const { droneCentre, fromDrone } = state
    droneCentre.copy(store.renderPosition)
    droneCentre.y += DRONE_CENTRE_HEIGHT

    if (!shouldFollow) {
      if (!zoom.wantsDroneFocus()) return

      orbit.target.lerp(droneCentre, 1 - Math.exp(-seconds / FOLLOW_CAMERA.targetTimeConstantSeconds))
      if (orbit.target.distanceTo(droneCentre) > SETTLED_DISTANCE) {
        invalidate()
      } else {
        zoom.markDroneFocused()
      }
      return
    }

    const { distanceBehind, heightAbove, minHeight, positionTimeConstantSeconds, targetTimeConstantSeconds } =
      FOLLOW_CAMERA
    const heading = MathUtils.degToRad(store.getYawDegrees())
    const scale = zoom.getDistance() / Math.hypot(distanceBehind, heightAbove)

    state.desiredPosition.set(
      droneCentre.x - Math.sin(heading) * distanceBehind * scale,
      Math.max(droneCentre.y + heightAbove * scale, minHeight),
      droneCentre.z + Math.cos(heading) * distanceBehind * scale,
    )

    camera.position.lerp(state.desiredPosition, 1 - Math.exp(-seconds / positionTimeConstantSeconds))
    state.lookTarget.lerp(droneCentre, 1 - Math.exp(-seconds / targetTimeConstantSeconds))

    // Trailing lags behind the drone. Close up, a fast turn or flying backwards could
    // otherwise carry the drone through the camera.
    fromDrone.subVectors(camera.position, droneCentre)
    if (fromDrone.length() < zoom.minDistance) {
      camera.position.copy(droneCentre).add(fromDrone.setLength(zoom.minDistance))
      camera.position.y = Math.max(camera.position.y, minHeight)
    }
    camera.lookAt(state.lookTarget)

    if (
      camera.position.distanceTo(state.desiredPosition) > SETTLED_DISTANCE ||
      state.lookTarget.distanceTo(droneCentre) > SETTLED_DISTANCE
    ) {
      invalidate()
    }
  })

  return null
}
