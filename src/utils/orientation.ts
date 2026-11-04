import { Euler, MathUtils, Quaternion } from 'three'
import { TELEMETRY_CONFIG } from '../config/telemetry'
import type { Attitude } from '../types/telemetry'

/**
 * Telemetry follows the usual aviation convention, as seen from the drone:
 *
 * - Positive roll lowers the right side.
 * - Positive pitch raises the nose.
 * - Positive yaw turns the nose to the right, clockwise from above. Zero faces
 *   world -Z, which is the way the model faces when unrotated.
 *
 * The model's forward is -Z, right is +X and up is +Y (see config/world.ts). A
 * positive three.js rotation about Z lifts +X and one about Y turns -Z towards
 * -X, so roll and yaw change sign. A positive rotation about X lifts -Z, so
 * pitch keeps its sign.
 *
 * YXZ applies yaw, then pitch, then roll, each about the drone's own axes, which
 * is how these angles are defined.
 */
const scratchEuler = new Euler()

export function bodyAttitudeToQuaternion(attitude: Attitude, target: Quaternion) {
  scratchEuler.set(
    MathUtils.degToRad(attitude.pitch),
    MathUtils.degToRad(-attitude.yaw),
    MathUtils.degToRad(-attitude.roll),
    'YXZ',
  )
  return target.setFromEuler(scratchEuler)
}

/** Takes telemetry, so it also corrects for the direction of the real sensor's axes. */
export function attitudeToQuaternion(attitude: Attitude, target: Quaternion) {
  const { signs } = TELEMETRY_CONFIG
  return bodyAttitudeToQuaternion(
    {
      roll: attitude.roll * signs.roll,
      pitch: attitude.pitch * signs.pitch,
      yaw: attitude.yaw * signs.yaw,
    },
    target,
  )
}

/** Wraps an angle into the range 0 up to (but not including) 360. */
export function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360
}

/** Below this the remaining gap isn't visible, so the model can stop at its target. */
const SETTLED_RADIANS = MathUtils.degToRad(0.03)

/**
 * Moves `current` towards `target` for a frame lasting `deltaSeconds`, and
 * returns whether it has arrived. Going through quaternions takes the short way
 * round on every axis, so yaw from 359° to 1° turns by 2°, not 358°.
 */
export function stepOrientation(
  current: Quaternion,
  target: Quaternion,
  deltaSeconds: number,
  timeConstantSeconds: number,
) {
  const progress =
    timeConstantSeconds > 0 ? 1 - Math.exp(-deltaSeconds / timeConstantSeconds) : 1
  current.slerp(target, progress)

  if (current.angleTo(target) < SETTLED_RADIANS) {
    current.copy(target)
    return true
  }
  return false
}
