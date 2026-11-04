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
  /** True while the drone is held at the edge of the flight area. */
  isAtBoundary: boolean
  cameraMode: CameraMode
  /** Why a command was refused or what it did, if there is something to say. */
  message: string | null
}
