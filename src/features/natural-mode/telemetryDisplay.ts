import type { TelemetryHealth } from '../../types/telemetry'

export const HEALTH_DISPLAY: Record<TelemetryHealth, { label: string; dotClass: string }> = {
  live: { label: 'Connected', dotClass: 'bg-emerald-400' },
  connecting: { label: 'Connecting…', dotClass: 'bg-sky-400' },
  waiting: { label: 'Waiting for data', dotClass: 'bg-sky-400' },
  stale: { label: 'Stale data', dotClass: 'bg-amber-400' },
  invalid: { label: 'Invalid telemetry', dotClass: 'bg-red-500' },
  disconnected: { label: 'Disconnected', dotClass: 'bg-slate-500' },
}
