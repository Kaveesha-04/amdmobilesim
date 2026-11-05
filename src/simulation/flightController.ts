import { DRONE_GROUND_Y, DRONE_SIZE, FLIGHT_CONTROL, FLIGHT_PHYSICS, PROPELLERS } from '../config/flight'
import type { FlightControls, FlightMode, FlightSetpoint } from '../types/flight'
import type { DroneState } from './flightPhysics'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const DEGREES_PER_RADIAN = 180 / Math.PI

/** The tilt that keeps the propeller tips off the ground at the drone's current height. */
function tiltLimitNearGround(drone: DroneState) {
  const height = drone.position.y - DRONE_GROUND_Y
  return Math.asin(clamp(height / DRONE_SIZE.reach, 0, 1)) * DEGREES_PER_RADIAN
}

/** The virtual flight controller: turns controls into what the physics should aim for. */
export function computeSetpoint(
  controls: FlightControls,
  mode: FlightMode,
  drone: DroneState,
): FlightSetpoint {
  const isArmed = mode !== 'DISARMED'
  const { maxTiltDegrees, maxYawRateDegrees } = FLIGHT_CONTROL

  let rollDegrees = drone.attitude.roll
  let pitchDegrees = drone.attitude.pitch

  if (isArmed) {
    // Pushing diagonally shouldn't tilt further than pushing straight.
    const stick = Math.hypot(controls.roll, controls.pitch)
    const scale = maxTiltDegrees / Math.max(stick, 1)
    rollDegrees = controls.roll * scale
    // Positive pitch raises the nose, and pushing forward lowers it.
    pitchDegrees = -controls.pitch * scale
  }

  const tilt = Math.hypot(rollDegrees, pitchDegrees)
  const limit = tiltLimitNearGround(drone)
  if (tilt > limit) {
    rollDegrees *= limit / tilt
    pitchDegrees *= limit / tilt
  }

  // Tilting points thrust away from vertical. Making up for it means forward flight
  // doesn't also sink, as long as there's enough thrust in reserve.
  const { x, z } = drone.quaternion
  const upwardShare = 1 - 2 * (x * x + z * z)
  const thrust = isArmed
    ? Math.min(
        (controls.throttle * FLIGHT_PHYSICS.maxThrust) / Math.max(upwardShare, 0.5),
        FLIGHT_PHYSICS.maxThrust,
      )
    : 0

  return {
    thrust,
    rollDegrees,
    pitchDegrees,
    yawRateDegrees: isArmed && !drone.isGrounded ? controls.yaw * maxYawRateDegrees : 0,
  }
}

/** Why arming isn't allowed right now, or null if it is. */
export function armingBlock(controls: FlightControls, drone: DroneState) {
  if (!drone.isGrounded) return 'Cannot arm in the air. Land first.'
  if (controls.throttle > FLIGHT_CONTROL.maxThrottleToArm) return 'Lower the throttle to arm.'
  return null
}

/** Changes of state that follow from the flight itself. Arming and disarming are commands. */
export function nextFlightMode(
  mode: FlightMode,
  controls: FlightControls,
  drone: DroneState,
): FlightMode {
  if (mode === 'DISARMED') return mode
  if (drone.isGrounded) return 'ARMED'

  const isDescending = drone.velocity.y < -0.1
  return controls.throttle < FLIGHT_CONTROL.landingThrottle && isDescending ? 'LANDING' : 'FLYING'
}

/**
 * The output each motor would have, from 0 to 1, in the order of PROPELLERS. It
 * drives the propeller animation. The physics works from the setpoint instead, so
 * it isn't simulating each motor's own thrust.
 */
export function computeMotorTargets(
  controls: FlightControls,
  setpoint: FlightSetpoint,
  mode: FlightMode,
  drone: DroneState,
  targets: number[],
) {
  const { motorIdle, motorMixAmount } = FLIGHT_CONTROL
  const isArmed = mode !== 'DISARMED'
  const base = Math.max(motorIdle, setpoint.thrust / FLIGHT_PHYSICS.maxThrust)
  const mix = drone.isGrounded ? 0 : motorMixAmount

  PROPELLERS.forEach(({ rollMix, pitchMix, yawMix }, index) => {
    const output =
      base +
      mix * (rollMix * controls.roll + pitchMix * controls.pitch + yawMix * controls.yaw)
    targets[index] = isArmed ? clamp(output, 0, 1) : 0
  })
}
