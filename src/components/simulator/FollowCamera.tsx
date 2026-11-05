import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { MathUtils, Vector3 } from 'three'
import { FOLLOW_CAMERA } from '../../config/flight'
import type { FlightStore } from '../../stores/flightStore'

/** A longer gap than this between frames still only moves the camera this far, so it can't jump. */
const MAX_FRAME_SECONDS = 0.05
const SETTLED_DISTANCE = 0.002

/** The parts of the scene's OrbitControls used here. */
interface OrbitControlsLike {
  enabled: boolean
  target: Vector3
}

/**
 * Trails behind the drone's heading while the follow camera is on, and hands over
 * to the scene's OrbitControls while it's off. Each picks up from where the other
 * left the camera. Heading alone sets the place to follow, so tilting the drone
 * doesn't swing the camera about.
 */
export function FollowCamera({ store }: { store: FlightStore }) {
  const [state] = useState(() => ({
    isFollowing: false,
    lookTarget: new Vector3(),
    desiredPosition: new Vector3(),
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
    if (!shouldFollow) return

    const { distanceBehind, heightAbove, minHeight, positionTimeConstantSeconds, targetTimeConstantSeconds } =
      FOLLOW_CAMERA
    const seconds = Math.min(delta, MAX_FRAME_SECONDS)
    const heading = MathUtils.degToRad(store.getYawDegrees())
    const drone = store.renderPosition

    state.desiredPosition.set(
      drone.x - Math.sin(heading) * distanceBehind,
      Math.max(drone.y + heightAbove, minHeight),
      drone.z + Math.cos(heading) * distanceBehind,
    )

    camera.position.lerp(state.desiredPosition, 1 - Math.exp(-seconds / positionTimeConstantSeconds))
    state.lookTarget.lerp(drone, 1 - Math.exp(-seconds / targetTimeConstantSeconds))
    camera.lookAt(state.lookTarget)

    if (
      camera.position.distanceTo(state.desiredPosition) > SETTLED_DISTANCE ||
      state.lookTarget.distanceTo(drone) > SETTLED_DISTANCE
    ) {
      invalidate()
    }
  })

  return null
}
