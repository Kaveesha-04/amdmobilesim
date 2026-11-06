import { useEffect, useState } from 'react'
import { FLIGHT_KEY_MAP } from '../../config/flight'
import { DEFAULT_FLIGHT_AREA } from '../../config/world'
import { ArtificialModeView } from '../../features/artificial-mode/ArtificialModeView'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import { PilotInputSource } from '../../services/flightInput/PilotInputSource'
import { FlightStore } from '../../stores/flightStore'
import { PanelProvider } from '../../stores/PanelProvider'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { PanelLayer } from './PanelLayer'
import { TopStatusBar } from './TopStatusBar'

function GlassPreference() {
  const { reduceGlass } = useDisplayPreferences()

  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-glass', reduceGlass)
  }, [reduceGlass])

  return null
}

/**
 * The full-screen interface. The scene and the interface are siblings, and panel
 * state lives in a provider above them that only the interface reads, so nothing
 * the visitor does here re-renders or rebuilds the 3D scene.
 */
export function SimulatorShell() {
  const [pilot] = useState(() => new PilotInputSource(FLIGHT_KEY_MAP))
  const [store] = useState(() => new FlightStore(pilot, DEFAULT_FLIGHT_AREA))

  useEffect(() => {
    store.start()
    return () => store.stop()
  }, [store])

  return (
    <PanelProvider>
      <GlassPreference />
      <div className="relative h-full w-full overflow-hidden">
        <main className="absolute inset-0">
          <ErrorBoundary>
            <ArtificialModeView store={store} pilot={pilot} />
          </ErrorBoundary>
        </main>
        <TopStatusBar store={store} />
        <PanelLayer store={store} />
      </div>
    </PanelProvider>
  )
}
