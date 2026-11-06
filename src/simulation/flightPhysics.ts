import { Quaternion, Vector3 } from 'three'
import { DRONE_GROUND_Y, DRONE_SIZE, DRONE_START_POSITION, FLIGHT_CONTROL, FLIGHT_PHYSICS } from '../config/flight'
import { GROUND_HEIGHT, type FlightArea } from '../config/world'
import type { Attitude, FlightSetpoint } from '../types/flight'
import { bodyAttitudeToQuaternion, normalizeDegrees } from '../utils/orientation'

/** The only place the drone's position and rotation are worked out. */
export interface DroneState {
  position: Vector3
  velocity: Vector3
  /** In degrees, with the signs described in utils/orientation.ts. */
  attitude: Attitude
  /** Always kept in step with `attitude`. */
  quaternion: Quaternion
  isGrounded: boolean
  isAtBoundary: boolean
}

export function createDroneState(): DroneState {
  return {
    position: new Vector3(...DRONE_START_POSITION),
    velocity: new Vector3(),
    attitude: { roll: 0, pitch: 0, yaw: 0 },
    quaternion: new Quaternion(),
    isGrounded: true,
    isAtBoundary: false,
  }
}

const bodyUp = new Vector3()

/**
 * Advances the drone by one step. Thrust acts along the drone's own up axis, so
 * tilting is what moves it sideways. Velocity is updated before position, which
 * keeps this stable at the fixed step.
 */
export function stepPhysics(
  drone: DroneState,
  setpoint: FlightSetpoint,
  area: FlightArea,
  deltaSeconds: number,
) {
  const { gravity, drag, groundFriction } = FLIGHT_PHYSICS
  const { attitude, position, velocity } = drone

  const tiltProgress = 1 - Math.exp(-deltaSeconds / FLIGHT_CONTROL.attitudeTimeConstantSeconds)
  attitude.roll += (setpoint.rollDegrees - attitude.roll) * tiltProgress
  attitude.pitch += (setpoint.pitchDegrees - attitude.pitch) * tiltProgress
  attitude.yaw = normalizeDegrees(attitude.yaw + setpoint.yawRateDegrees * deltaSeconds)
  bodyAttitudeToQuaternion(attitude, drone.quaternion)

  bodyUp.set(0, 1, 0).applyQuaternion(drone.quaternion)
  velocity.addScaledVector(bodyUp, setpoint.thrust * deltaSeconds)
  velocity.y -= gravity * deltaSeconds
  velocity.multiplyScalar(Math.exp(-drag * deltaSeconds))
  position.addScaledVector(velocity, deltaSeconds)

  applyLimits(drone, area, groundFriction, deltaSeconds)
}

function applyLimits(
  drone: DroneState,
  area: FlightArea,
  groundFriction: number,
  deltaSeconds: number,
) {
  const { position, velocity } = drone

  // Kept far enough in that the propeller tips stay within the marked boundary.
  const maxX = area.width / 2 - DRONE_SIZE.reach
  const maxZ = area.depth / 2 - DRONE_SIZE.reach
  const maxY = GROUND_HEIGHT + area.height - DRONE_SIZE.top

  drone.isAtBoundary = false

  if (Math.abs(position.x) >= maxX) {
    position.x = Math.sign(position.x) * maxX
    if (velocity.x * position.x > 0) velocity.x = 0
    drone.isAtBoundary = true
  }
  if (Math.abs(position.z) >= maxZ) {
    position.z = Math.sign(position.z) * maxZ
    if (velocity.z * position.z > 0) velocity.z = 0
    drone.isAtBoundary = true
  }
  if (position.y >= maxY) {
    position.y = maxY
    if (velocity.y > 0) velocity.y = 0
    drone.isAtBoundary = true
  }

  drone.isGrounded = position.y <= DRONE_GROUND_Y
  if (drone.isGrounded) {
    position.y = DRONE_GROUND_Y
    if (velocity.y < 0) velocity.y = 0
    const friction = Math.exp(-groundFriction * deltaSeconds)
    velocity.x *= friction
    velocity.z *= friction
  }
}
