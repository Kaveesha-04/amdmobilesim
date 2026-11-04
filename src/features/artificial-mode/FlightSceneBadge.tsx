import { useSyncExternalStore } from 'react'
import type { FlightStore } from '../../stores/flightStore'

/** Puts a failsafe or a device fault on the 3D view, where whoever is flying is looking. */
export function FlightSceneBadge({ store }: { store: FlightStore }) {
  const { inputFault, message } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const warning = message?.startsWith('Failsafe') ? message : inputFault

  if (!warning) return null

  return (
    <div
      className="pointer-events-none absolute top-3 left-3 flex max-w-[90%] items-center gap-2 rounded-lg border border-red-500/60 bg-slate-950/90 px-3 py-1.5 text-xs text-red-200"
      data-flight-warning
      role="alert"
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-red-500" />
      {warning}
    </div>
  )
}
