export type FlightMode = 'DISARMED' | 'ARMED' | 'FLYING' | 'LANDING'

export type CameraMode = 'follow' | 'free'

/** The four control channels, whatever device they come from. */
export interface FlightControls {
  /** 0 to 1. */
  throttle: number
  /** -1 to +1. Positive tilts right. */
  roll: number
  /** -1 to +1. Positive tilts forward, so it is the opposite sign to a pitch angle. */
  pitch: number
  /** -1 to +1. Positive turns the nose right. */
  yaw: number
}

export type FlightCommand = 'arm' | 'disarm' | 'reset' | 'toggle-camera'

/** What the virtual flight controller asks of the physics. */
export interface FlightSetpoint {
  /** Acceleration from the motors along the drone's up axis, in m/s². */
  thrust: number
  rollDegrees: number
  pitchDegrees: number
  yawRateDegrees: number
}

/** What the interface shows. Updated a few times a second, not every physics step. */
export interface FlightSnapshot {
  mode: FlightMode
  controls: FlightControls
  /** Height of the landing gear above the ground, in metres. */
  altitude: number
  horizontalSpeed: number
  verticalSpeed: number
  position: { x: number; y: number; z: number }
  /** The virtual drone's orientation, in degrees. */
  attitude: { roll: number; pitch: number; yaw: number }
  /** Each virtual motor's output from 0 to 1, in the order of PROPELLERS. */
  motorOutputs: number[]
  /** True while the drone is held at the edge of the flight area. */
  isAtBoundary: boolean
  cameraMode: CameraMode
  /** Why a command was refused or what it did, if there is something to say. */
  message: string | null
  /** Why the selected input device can't be used right now, or null if it can. */
  inputFault: string | null
}
