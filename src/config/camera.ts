import type { Vector3Tuple } from 'three'
import { FOLLOW_CAMERA } from './flight'

export interface CameraPreset {
  fov: number
  /** Starting camera position, relative to the drone it focuses on. */
  offset: Vector3Tuple
  /** The closest the camera can get to the drone's centre. */
  minDistance: number
  /** The furthest the camera can get from the drone's centre. */
  maxDistance: number
  /** Where Reset Zoom returns to, and what the zoom level is a percentage of. */
  defaultDistance: number
}

/**
 * The camera orbits the drone's centre, so staying outside a sphere around it holds
 * at any attitude. The spinning propellers reach 0.352 m from the centre, from
 * MoonLady_Beta_1.glb, and the corners of the camera's near plane reach up to
 * 0.08 m in front of it. That leaves a little room.
 */
const CLOSEST_DISTANCE = 0.45

/** Far enough back to show the drone on its stand with the hall behind it. */
const INSPECTION_OFFSET: Vector3Tuple = [1.05, 0.55, 1.6]

export const INSPECTION_CAMERA: CameraPreset = {
  fov: 50,
  offset: INSPECTION_OFFSET,
  minDistance: CLOSEST_DISTANCE,
  maxDistance: 8,
  defaultDistance: Math.hypot(...INSPECTION_OFFSET),
}

/**
 * From behind the drone, facing the way it points. Pulled all the way back with the
 * drone in the middle of the flight area, the camera is still inside the hall.
 */
export const FLIGHT_CAMERA: CameraPreset = {
  fov: 55,
  offset: [0.9, 0.6, 1.8],
  minDistance: CLOSEST_DISTANCE,
  maxDistance: 26,
  // The drone starts with the follow camera on, so this is the distance visitors first see.
  defaultDistance: Math.hypot(FOLLOW_CAMERA.distanceBehind, FOLLOW_CAMERA.heightAbove),
}

export const CAMERA_ZOOM = {
  /** How much one press of the zoom buttons changes the distance. */
  buttonFactor: 1.25,
  /** How quickly the camera catches up with the slider. */
  timeConstantSeconds: 0.12,
  /** How much one notch of the mouse wheel (100 pixels) changes the distance. Matches OrbitControls. */
  wheelFactorPerNotch: 1 / 0.95,
}
