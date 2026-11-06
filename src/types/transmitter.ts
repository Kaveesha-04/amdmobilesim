/** The transmitter's values as the Signal Receiver reports them, before calibration. */
export interface RawTransmitterData {
  throttle: number
  roll: number
  pitch: number
  yaw: number
  /** Whether the ESP32 reports its NRF radio link as working. */
  nrfOk: boolean
  /** Set by the receiver when it gets a message from the ESP32. */
  timestamp: number
}

export type TransmitterChannel = 'throttle' | 'roll' | 'pitch' | 'yaw'

/** All values are in the channel's own raw units. */
export interface ChannelCalibration {
  min: number
  max: number
  /** The stick's resting value. Roll, pitch and yaw need it; throttle has none. */
  center?: number
  /** How far from rest, or from the bottom on throttle, still reads as zero. */
  deadband: number
  invert: boolean
}

export type TransmitterCalibration = Record<TransmitterChannel, ChannelCalibration>

export type ServerStatus = 'connecting' | 'connected' | 'disconnected'

export type TransmitterHealth =
  /** The receiver can't be reached, or hasn't answered yet. */
  | 'disconnected'
  /** The receiver answers, but no message has arrived from the ESP32 since connecting. */
  | 'waiting'
  | 'connected'
  /** The receiver answers, but the radio link is down or its data has stopped changing. */
  | 'signal-lost'
  | 'invalid'

export interface TransmitterState {
  /** The connection to the Node.js receiver only. It says nothing about the radio link. */
  serverStatus: ServerStatus
  health: TransmitterHealth
  /** The last well-formed data. It is kept to show after a loss, but never used to fly. */
  raw: RawTransmitterData | null
  /** Why health isn't 'connected', if there's more to say than the status. */
  problem: string | null
  /** How long since the data last changed, by this browser's clock. Null before it has changed. */
  dataAgeMs: number | null
}
