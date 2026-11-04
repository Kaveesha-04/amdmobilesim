import { MockTelemetryProvider } from './MockTelemetryProvider'
import type { TelemetryProvider } from './TelemetryProvider'

export interface TelemetrySource {
  /** Null when there is nothing to connect to. */
  provider: TelemetryProvider | null
  /** Set only when `provider` is the mock, so that the two can't be mixed. */
  mock: MockTelemetryProvider | null
}

/**
 * The one place that decides where telemetry comes from. The drone's way of sending
 * its orientation isn't confirmed yet, so a production build has no source and
 * reports itself as disconnected. A provider for the real drone gets returned from
 * here. `Signal Reciever/server.js` isn't one: it carries the transmitter's stick
 * inputs, which belong to Artificial Mode and say nothing about the drone's attitude.
 */
export function createTelemetrySource(): TelemetrySource {
  if (import.meta.env.DEV) {
    const mock = new MockTelemetryProvider()
    return { provider: mock, mock }
  }

  return { provider: null, mock: null }
}
