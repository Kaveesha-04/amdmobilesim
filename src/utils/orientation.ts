import { Euler, MathUtils, Quaternion } from 'three'
import type { Attitude } from '../types/flight'

/**
 * The drone's attitude follows the usual aviation convention, as seen from the drone:
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

/** Wraps an angle into the range 0 up to (but not including) 360. */
export function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360
}
