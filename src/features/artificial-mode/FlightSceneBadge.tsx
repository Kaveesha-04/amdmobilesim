import { useSyncExternalStore } from 'react'
import type { FlightStore } from '../../stores/flightStore'

/** Puts a failsafe or a device fault on the 3D view, where whoever is flying is looking. */
export function FlightSceneBadge({ store }: { store: FlightStore }) {
  const { inputFault, message } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const warning = message?.startsWith('Failsafe') ? message : inputFault

  if (!warning) return null

  return (
    <div
      className="pointer-events-none glass absolute top-20 left-4 flex max-w-[60%] items-center gap-2 rounded-xl !border-warn/70 px-3 py-1.5 text-sm text-red-100"
      data-flight-warning
      role="alert"
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-warn" />
      {warning}
    </div>
  )
}
