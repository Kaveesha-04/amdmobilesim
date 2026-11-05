import type { Vector3, Vector3Tuple } from 'three'

/**
 * The exhibition hall, in the same world coordinates as config/world.ts. It's centred
 * on the origin and built around the 40 x 40 x 15 m flight area, leaving a clear walkway
 * on every side. Nothing in the hall is an obstacle: only the flight area limits the drone.
 */
export const HALL = {
  /** Size along X and along Z. */
  size: 60,
  height: 18.5,
  /** The underside of the lowest ceiling beam. */
  beamBottom: 17,
  /** How far each pillar's centre is from the hall's centre line. */
  pillarLine: 27.5,
  pillarWidth: 1.2,
}

/** Ceiling lights sit where these lines cross, along X and along Z. */
export const FIXTURE_LINES = [-20, -10, 0, 10, 20]
/** Main beams and cross beams run between the lights, along these lines. */
export const BEAM_LINES = [-25, -15, -5, 5, 15, 25]

export const HALL_COLORS = {
  environment: '#080D18',
  metal: '#1E293B',
  accent: '#007FFF',
  /** For text and fine graphics on the screens, where the primary azure is too dark to read well. */
  accentLight: '#38BDF8',
  /** For large or low-priority markings, which would glare in the primary azure. */
  accentDeep: '#075985',
  accentGlow: 'rgba(0, 127, 255, 0.35)',
  secondaryAccent: '#FF7556',
  displayLight: '#F4F1E8',
}

/** Where the soft main light is relative to the drone. */
export const KEY_LIGHT_OFFSET: Vector3Tuple = [6, 14, 5]

/** The camera stays this side of the pillars and beams, so that it can't end up inside them or outside the walls. */
const CAMERA_LIMIT_XZ = HALL.pillarLine - HALL.pillarWidth / 2 - 0.5
const CAMERA_LIMIT_TOP = HALL.beamBottom - 0.5

/** Brings a position back inside the hall. Returns whether it had to. */
export function clampToHall(position: Vector3) {
  const { x, y, z } = position
  position.x = Math.min(Math.max(x, -CAMERA_LIMIT_XZ), CAMERA_LIMIT_XZ)
  position.y = Math.min(y, CAMERA_LIMIT_TOP)
  position.z = Math.min(Math.max(z, -CAMERA_LIMIT_XZ), CAMERA_LIMIT_XZ)
  return position.x !== x || position.y !== y || position.z !== z
}
