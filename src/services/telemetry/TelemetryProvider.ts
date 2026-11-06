import type { ConnectionStatus } from '../../types/telemetry'

export type TelemetryEvent =
  | { type: 'status'; status: ConnectionStatus }
  /** Left unchecked here, because everything received is validated in one place, by the store. */
  | { type: 'sample'; sample: unknown }

/**
 * What the app needs from a source of drone telemetry, whatever the transport.
 *
 * Samples should have the shape of TelemetrySample, with angles in degrees, so
 * an adapter for real hardware converts to that from the drone's own format.
 */
export interface TelemetryProvider {
  /** Shown in the interface, to identify where the data comes from. */
  readonly name: string
  /** True for any source that isn't the actual drone. */
  readonly isSimulated: boolean
  connect(): void
  disconnect(): void
  /** Returns the function that unsubscribes. */
  subscribe(listener: (event: TelemetryEvent) => void): () => void
}
