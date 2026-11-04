import { useTelemetryState } from '../../hooks/useTelemetryState'
import type { TelemetryStore } from '../../stores/telemetryStore'
import { HEALTH_DISPLAY } from './telemetryDisplay'

/** Says so on the 3D view whenever the model isn't following live data, as a still model looks the same either way. */
export function TelemetrySceneBadge({ store }: { store: TelemetryStore }) {
  const { health, sample } = useTelemetryState(store)

  if (health === 'live') return null

  const { label, dotClass } = HEALTH_DISPLAY[health]

  return (
    <div
      className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/90 px-3 py-1.5 text-xs text-slate-200"
      data-scene-badge
    >
      <span aria-hidden="true" className={`size-2 rounded-full ${dotClass}`} />
      {label}: {sample ? 'showing last valid orientation' : 'no orientation data'}
    </div>
  )
}
