/** Orientation in degrees. The sign of each angle is described in utils/orientation.ts. */
export interface Attitude {
  roll: number
  pitch: number
  yaw: number
}

/** One validated reading. Only values that passed validation take this type. */
export interface TelemetrySample extends Attitude {
  /** The sender's own time. Its clock is unknown, so staleness uses the time of receipt instead. */
  timestamp: number
}

/** The state of the link, as reported by a telemetry provider. */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

/** The state of the link and its data together, which is what the interface shows. */
export type TelemetryHealth =
  | 'disconnected'
  | 'connecting'
  /** Connected, but nothing has arrived since connecting. */
  | 'waiting'
  | 'live'
  /** Connected, but nothing has arrived recently. */
  | 'stale'
  /** The latest reading was rejected. */
  | 'invalid'

export interface TelemetryState {
  health: TelemetryHealth
  /** The last valid reading. It is kept when the link drops, and rejected readings never reach it. */
  sample: TelemetrySample | null
  /** Local time, in milliseconds since the epoch, when `sample` arrived. */
  lastReceivedAt: number | null
  /** Why the latest reading was rejected, while health is 'invalid'. */
  invalidReason: string | null
}
