import { useSyncExternalStore } from 'react'
import { FlightHud } from '../../features/artificial-mode/FlightHud'
import { TransmitterPanel } from '../../features/artificial-mode/TransmitterPanel'
import { useModeRuntime } from '../../hooks/useModeRuntime'
import type { ArtificialRuntime } from '../../stores/ModeRuntimeContext'
import { PreparingMode } from './PanelParts'

function Content({ runtime }: { runtime: ArtificialRuntime }) {
  const { store, inputs, configuredReceiverUrl, calibrationError, staleAfterMs } = runtime
  const kind = useSyncExternalStore(inputs.subscribeToKind, inputs.getKind)

  return (
    <>
      <p className="text-sm font-medium text-accent">Artificial Mode is active</p>
      <FlightHud store={store} inputs={inputs} />
      {kind === 'transmitter' && (
        <TransmitterPanel
          source={inputs.transmitterSource}
          store={store}
          configuredUrl={configuredReceiverUrl}
          calibrationError={calibrationError}
          staleAfterMs={staleAfterMs}
        />
      )}
    </>
  )
}

export function ArtificialModePanel() {
  const runtime = useModeRuntime()
  return runtime?.mode === 'artificial' ? <Content runtime={runtime} /> : <PreparingMode />
}
