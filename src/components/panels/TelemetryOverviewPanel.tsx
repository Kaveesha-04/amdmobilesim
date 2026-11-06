import { useSyncExternalStore } from 'react'
import { TransmitterPanel } from '../../features/artificial-mode/TransmitterPanel'
import { TelemetryPanel } from '../../features/natural-mode/TelemetryPanel'
import { useModeRuntime } from '../../hooks/useModeRuntime'
import type { ArtificialRuntime, NaturalRuntime } from '../../stores/ModeRuntimeContext'
import { PanelText, PreparingMode } from './PanelParts'

const SOURCE_STYLE = {
  simulated: 'bg-warn text-slate-950',
  live: 'bg-accent text-slate-950',
  none: 'bg-slate-700 text-slate-100',
}

function SourceTag({ kind, children }: { kind: keyof typeof SOURCE_STYLE; children: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${SOURCE_STYLE[kind]}`}
      data-telemetry-source={kind}
    >
      {children}
    </span>
  )
}

function Row({ label, value, name }: { label: string; value: string; name: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums" data-telemetry-value={name}>
        {value}
      </dd>
    </div>
  )
}

function NaturalTelemetry({ runtime }: { runtime: NaturalRuntime }) {
  const { store, sourceName, isSimulated } = runtime

  return (
    <>
      {isSimulated ? (
        <SourceTag kind="simulated">Simulated data, not the real drone</SourceTag>
      ) : sourceName ? (
        <SourceTag kind="live">{`Drone telemetry: ${sourceName}`}</SourceTag>
      ) : (
        <SourceTag kind="none">No telemetry source configured</SourceTag>
      )}
      <TelemetryPanel store={store} sourceName={sourceName} isSimulated={isSimulated} />
      <PanelText>Throttle isn't shown here, because orientation telemetry doesn't report it.</PanelText>
    </>
  )
}

const percent = (value: number) => `${Math.round(value * 100)}%`
const degrees = (value: number) => `${value.toFixed(1)}°`

function ArtificialTelemetry({ runtime }: { runtime: ArtificialRuntime }) {
  const { store, inputs, configuredReceiverUrl, staleAfterMs } = runtime
  const kind = useSyncExternalStore(inputs.subscribeToKind, inputs.getKind)
  const { attitude, controls } = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return (
    <>
      {kind === 'keyboard' ? (
        <SourceTag kind="simulated">Virtual flight: keyboard input</SourceTag>
      ) : (
        <SourceTag kind="live">Transmitter input from the Signal Receiver</SourceTag>
      )}

      <section aria-label="Virtual drone" className="glass-section">
        <p className="mb-3 text-xs text-slate-400">
          Calculated by the simulator, never measured from a real drone.
        </p>
        <dl className="grid grid-cols-2 gap-3">
          <Row label="Roll" value={degrees(attitude.roll)} name="roll" />
          <Row label="Pitch" value={degrees(attitude.pitch)} name="pitch" />
          <Row label="Yaw" value={degrees(attitude.yaw)} name="yaw" />
          <Row label="Throttle" value={percent(controls.throttle)} name="throttle" />
        </dl>
      </section>

      {kind === 'keyboard' ? (
        <PanelText>
          There's no connection to check, or data freshness to report, because the keyboard is part
          of this computer.
        </PanelText>
      ) : (
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

export function TelemetryOverviewPanel() {
  const runtime = useModeRuntime()

  if (runtime?.mode === 'natural') return <NaturalTelemetry runtime={runtime} />
  if (runtime?.mode === 'artificial') return <ArtificialTelemetry runtime={runtime} />
  return <PreparingMode />
}
