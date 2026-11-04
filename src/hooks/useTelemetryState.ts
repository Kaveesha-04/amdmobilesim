import { useSyncExternalStore } from 'react'
import type { TelemetryStore } from '../stores/telemetryStore'

/** Re-renders the calling component on every telemetry change, so keep it away from the 3D scene. */
export function useTelemetryState(store: TelemetryStore) {
  return useSyncExternalStore(store.subscribe, store.getState)
}
