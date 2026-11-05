import type { Vector3Tuple } from 'three'

/**
 * World coordinates, shared by every scene. All distances are metres.
 *
 * - Y is vertical, with up as +Y. The ground is at GROUND_HEIGHT.
 * - X and Z are horizontal. The origin is the centre of the flight area.
 * - Right-handed, as in three.js: +X is right when looking along -Z.
 *
 * Drone body axes, read from the part positions in MoonLady_Beta_1.glb:
 *
 * - Forward is -Z (Arm_Front_* and Propeller_F*), left is -X (*_Left), up is +Y.
 * - With no rotation applied, the drone's forward matches world -Z, so it needs
 *   no correcting rotation.
 * - Pitch turns about X, yaw about Y and roll about Z.
 * - The model's origin is the centre of the chassis, not its lowest point.
 */

export const GROUND_HEIGHT = 0

/** How far the model's centre sits above its origin, from its bounds of -0.071 to 0.165 m. */
export const DRONE_CENTRE_HEIGHT = 0.047

/** Where the sun is relative to the drone. It also sets the direction of the sky's sun. */
export const SUN_OFFSET: Vector3Tuple = [12, 18, 8]

export interface FlightArea {
  /** Size along X. */
  width: number
  /** Size along Z. */
  depth: number
  /** Ceiling above the ground. */
  height: number
}

export const DEFAULT_FLIGHT_AREA: FlightArea = { width: 40, depth: 40, height: 15 }
