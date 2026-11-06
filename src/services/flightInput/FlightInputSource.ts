import type { FlightCommand, FlightControls } from '../../types/flight'

export type FlightInputEvent =
  | { type: 'command'; command: FlightCommand }
  /** Something changed while the scene may be idle, so it needs to start updating. */
  | { type: 'activity' }

/** What the simulator needs from its input, so that the controls stay separate from the physics. */
export interface FlightInputSource {
  readonly name: string
  start(): void
  stop(): void
  /** The controls for a physics step lasting `deltaSeconds`. */
  read(deltaSeconds: number): FlightControls
  /** Called while disarmed and after a reset, so that the motors always start from zero. */
  resetThrottle(): void
  /** True while input is being held, so that the scene shouldn't go idle. */
  isActive(): boolean
  /** Returns the function that unsubscribes. */
  subscribe(listener: (event: FlightInputEvent) => void): () => void
}
