import { useState, useSyncExternalStore } from 'react'
import { FlightHud } from '../../features/artificial-mode/FlightHud'
import { MotorMonitor } from '../../features/artificial-mode/MotorMonitor'
import { TransmitterPanel } from '../../features/artificial-mode/TransmitterPanel'
import { useModeRuntime } from '../../hooks/useModeRuntime'
import type { ArtificialRuntime } from '../../stores/ModeRuntimeContext'
import { Choice, PreparingMode } from './PanelParts'

type ArtificialView = 'flight' | 'motors'

function ViewChoice({
  value,
  onChange,
}: {
  value: ArtificialView
  onChange: (view: ArtificialView) => void
}) {
  return (
    <Choice
      label="Show"
      name="view"
      value={value}
      options={[
        { value: 'flight', label: 'Flight' },
        { value: 'motors', label: 'Motor Monitor' },
      ]}
      onChange={onChange}
    />
  )
}

function Content({ runtime }: { runtime: ArtificialRuntime }) {
  const { store, inputs, configuredReceiverUrl, staleAfterMs } = runtime
  const kind = useSyncExternalStore(inputs.subscribeToKind, inputs.getKind)
  const [view, setView] = useState<ArtificialView>('flight')

  if (view === 'motors') {
    return (
      <>
        <ViewChoice value={view} onChange={setView} />
        <MotorMonitor store={store} />
      </>
    )
  }

  return (
    <>
      <p className="text-sm font-medium text-accent">Artificial Mode is active</p>
      <ViewChoice value={view} onChange={setView} />
      <FlightHud store={store} inputs={inputs} />
      {kind === 'transmitter' && (
        <TransmitterPanel
          source={inputs.transmitterSource}
          store={store}
          configuredUrl={configuredReceiverUrl}
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
