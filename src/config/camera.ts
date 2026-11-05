import type { Vector3Tuple } from 'three'

export interface CameraPreset {
  fov: number
  /** Starting camera position, relative to the drone it focuses on. */
  offset: Vector3Tuple
  minDistance: number
  maxDistance: number
}

/** Close up, for looking over the model. */
export const INSPECTION_CAMERA: CameraPreset = {
  fov: 50,
  offset: [0.55, 0.27, 0.75],
  minDistance: 0.3,
  maxDistance: 4,
}

/** From behind the drone, facing the way it points, and able to pull back over the whole area. */
export const FLIGHT_CAMERA: CameraPreset = {
  fov: 55,
  offset: [0.9, 0.6, 1.8],
  minDistance: 0.3,
  maxDistance: 60,
}
