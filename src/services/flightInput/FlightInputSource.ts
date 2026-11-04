import type { FlightCommand, FlightControls } from '../../types/flight'

export type FlightInputEvent =
  | { type: 'command'; command: FlightCommand }
  /** Something changed while the scene may be idle, so it needs to start updating. */
  | { type: 'activity' }

/** What the simulator needs from a control device, so that every device flies the same physics. */
export interface FlightInputSource {
  readonly name: string
  start(): void
  stop(): void
  /** The controls for a physics step lasting `deltaSeconds`. */
  read(deltaSeconds: number): FlightControls
  /** Called after a disarm or reset. A device with a physical throttle can ignore it. */
  resetThrottle(): void
  /** True while input is being held, so that the scene shouldn't go idle. */
  isActive(): boolean
  /**
   * Why this device can't be trusted right now, or null if it can. A fault stops the
   * motors, and read() gives neutral controls until it clears. A source must emit
   * 'activity' when this changes.
   */
  getFault(): string | null
  /** Returns the function that unsubscribes. */
  subscribe(listener: (event: FlightInputEvent) => void): () => void
}
