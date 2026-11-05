import { MockTelemetryControls } from '../../features/natural-mode/MockTelemetryControls'
import { TelemetryPanel } from '../../features/natural-mode/TelemetryPanel'
import { useModeRuntime } from '../../hooks/useModeRuntime'
import { PanelText, PreparingMode } from './PanelParts'

export function NaturalModePanel() {
  const runtime = useModeRuntime()

  if (runtime?.mode !== 'natural') return <PreparingMode />

  return (
    <>
      <p className="text-sm font-medium text-accent">Natural Mode is active</p>
      <PanelText>
        The model mirrors the real drone's orientation. It stays at one fixed position in the
        virtual world: only its roll, pitch and yaw change.
      </PanelText>
      <TelemetryPanel
        store={runtime.store}
        sourceName={runtime.sourceName}
        isSimulated={runtime.isSimulated}
      />
      {import.meta.env.DEV && runtime.mock && (
        <MockTelemetryControls mock={runtime.mock} store={runtime.store} />
      )}
    </>
  )
}
