import { MockTelemetryProvider } from './MockTelemetryProvider'
import type { TelemetryProvider } from './TelemetryProvider'

export interface TelemetrySource {
  /** Null when there is nothing to connect to. */
  provider: TelemetryProvider | null
  /** Set only when `provider` is the mock, so that the two can't be mixed. */
  mock: MockTelemetryProvider | null
}

/**
 * The one place that decides where telemetry comes from. A receiver for the ESP32
 * exists in `Signal Reciever/server.js`, but what its values mean isn't confirmed
 * yet, so nothing connects to it: a production build has no source and reports
 * itself as disconnected. A provider for the real drone gets returned from here.
 */
export function createTelemetrySource(): TelemetrySource {
  if (import.meta.env.DEV) {
    const mock = new MockTelemetryProvider()
    return { provider: mock, mock }
  }

  return { provider: null, mock: null }
}
