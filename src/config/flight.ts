import type { Vector3Tuple } from 'three'
import { GROUND_HEIGHT } from './world'

/**
 * Tuning for the virtual drone. This is a simplified teaching model chosen to feel
 * believable, not measured from the real MoonLady Beta 1. Distances are metres.
 */
export const FLIGHT_PHYSICS = {
  gravity: 9.81,
  /** Full-throttle acceleration. At twice gravity, the drone hovers at half throttle. */
  maxThrust: 19.62,
  /** Air resistance: each second, velocity loses about this fraction of itself. */
  drag: 0.8,
  /** How quickly the ground stops a sliding drone, in the same terms as drag. */
  groundFriction: 8,
  /** Physics always advances in this step, so that frame rate can't change the result. */
  fixedStepSeconds: 1 / 120,
  /** The most time simulated per frame, so that a stall can't cause a sudden leap. */
  maxFrameSeconds: 0.1,
}

export const FLIGHT_CONTROL = {
  /** The tilt at full stick. Reached in any direction, so diagonals don't tilt further. */
  maxTiltDegrees: 30,
  maxYawRateDegrees: 120,
  /** How quickly the drone reaches a commanded tilt: 63% of the way in this time. */
  attitudeTimeConstantSeconds: 0.15,
  /** Arming is refused above this, so that the drone can't jump into the air. */
  maxThrottleToArm: 0.05,
  /** Descending below this throttle counts as landing. Hover is 0.5. */
  landingThrottle: 0.45,
  /** How much a full stick input speeds up or slows down each motor. */
  motorMixAmount: 0.15,
  /** Motor output while armed at zero throttle. */
  motorIdle: 0.2,
  /** How quickly motors spin up and down. */
  motorTimeConstantSeconds: 0.15,
}

/** Sizes measured from MoonLady_Beta_1.glb, relative to the model's origin. */
export const DRONE_SIZE = {
  /** The landing gear's distance below the origin. */
  bottom: 0.071,
  /** The antenna's distance above the origin. */
  top: 0.165,
  /** From the centre to a propeller tip: 0.225 to the motor plus a 0.127 blade. */
  reach: 0.352,
}

/** The height of the origin when the landing gear rests on the ground. */
export const DRONE_GROUND_Y = GROUND_HEIGHT + DRONE_SIZE.bottom

export const DRONE_START_POSITION: Vector3Tuple = [0, DRONE_GROUND_Y, 0]

/**
 * The propellers, as named in the model. Positive speed is anticlockwise from
 * above, which is positive rotation about the shaft's local +Y. Opposite corners
 * turn the same way, as on a real quadcopter. The blades' pitch wasn't checked
 * against this, and the direction is only visual.
 *
 * `motor` and `position` are for display, and `side` and `end` give the corner as in
 * the model: left is -X and front is -Z, as read from Motor_*_Base in the GLB. The
 * numbering is this simulator's own, and says nothing about the real drone's wiring.
 */
export const PROPELLERS = [
  { name: 'Propeller_FL', motor: 1, position: 'Front Left', side: -1, end: -1, direction: -1, rollMix: 1, pitchMix: -1, yawMix: -1 },
  { name: 'Propeller_FR', motor: 2, position: 'Front Right', side: 1, end: -1, direction: 1, rollMix: -1, pitchMix: -1, yawMix: 1 },
  { name: 'Propeller_RL', motor: 3, position: 'Rear Left', side: -1, end: 1, direction: 1, rollMix: 1, pitchMix: 1, yawMix: 1 },
  { name: 'Propeller_RR', motor: 4, position: 'Rear Right', side: 1, end: 1, direction: -1, rollMix: -1, pitchMix: 1, yawMix: -1 },
] as const

/** The on-screen speed at full motor output, slow enough not to strobe at 60 frames a second. */
export const PROPELLER_MAX_RADIANS_PER_SECOND = 70

/** Values are `KeyboardEvent.code`, so the keys stay in the same place on any keyboard layout. */
export const FLIGHT_KEY_MAP = {
  pitchForward: ['KeyW'],
  pitchBackward: ['KeyS'],
  rollLeft: ['KeyA'],
  rollRight: ['KeyD'],
  throttleUp: ['ArrowUp'],
  throttleDown: ['ArrowDown'],
  yawLeft: ['KeyQ'],
  yawRight: ['KeyE'],
  arm: ['Enter'],
  disarm: ['Space'],
  reset: ['KeyR'],
  toggleCamera: ['KeyC'],
}

export type FlightKeyMap = typeof FLIGHT_KEY_MAP

/** How long it takes to move the throttle from zero to full with its key or stick held fully. */
export const THROTTLE_FULL_RANGE_SECONDS = 2.5

export const TOUCH_STICK = {
  /** Around the centre, as a share of the stick's travel, where nothing happens. */
  deadZone: 0.1,
  /** Above 1, small movements do less, which makes fine control easier on a small screen. */
  expo: 1.6,
  /** How far the knob's centre moves, as a share of the base's radius. */
  knobTravel: 0.6,
}

export const FOLLOW_CAMERA = {
  /** How far behind the drone's heading the camera sits. */
  distanceBehind: 3,
  /** How far above the drone the camera sits. */
  heightAbove: 1,
  /** Never lower than this, to keep the camera above the ground. */
  minHeight: 0.2,
  positionTimeConstantSeconds: 0.35,
  targetTimeConstantSeconds: 0.12,
}
