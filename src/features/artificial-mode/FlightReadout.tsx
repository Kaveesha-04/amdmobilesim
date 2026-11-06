import { useSyncExternalStore } from 'react'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import type { FlightStore } from '../../stores/flightStore'

/** The little a pilot needs while every panel is closed, kept small and out of the drone's way. */
export function FlightReadout({ store }: { store: FlightStore }) {
  const { showFlightReadout } = useDisplayPreferences()
  const { mode, controls, altitude, horizontalSpeed, inputFault } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
  )

  if (!showFlightReadout) return null

  return (
    <div
      className="glass pointer-events-none absolute bottom-4 left-4 hidden rounded-2xl px-4 py-2 text-sm tabular-nums lg:block"
      data-flight-readout
    >
      <span className="font-semibold text-accent">{mode}</span>
      {mode === 'DISARMED' && !inputFault ? (
        <span className="ml-3 text-slate-300">Press Enter to arm</span>
      ) : (
        <span className="ml-3 text-slate-300">
          Throttle {Math.round(controls.throttle * 100)}% · {altitude.toFixed(1)} m ·{' '}
          {horizontalSpeed.toFixed(1)} m/s
        </span>
      )}
    </div>
  )
}
