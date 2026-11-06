import { useSyncExternalStore } from 'react'
import { HEALTH_DISPLAY as TRANSMITTER_HEALTH } from '../../features/artificial-mode/TransmitterPanel'
import { modeRegistry } from '../../features/modeRegistry'
import { HEALTH_DISPLAY as TELEMETRY_HEALTH } from '../../features/natural-mode/telemetryDisplay'
import { useFullscreen } from '../../hooks/useFullscreen'
import { useModeRuntime } from '../../hooks/useModeRuntime'
import { useOperatingMode } from '../../hooks/useOperatingMode'
import type { ArtificialRuntime, NaturalRuntime } from '../../stores/ModeRuntimeContext'
import { UnderDevelopmentBadge } from '../common/UnderDevelopmentBadge'
import { EnterFullscreenIcon, ExitFullscreenIcon } from './Icons'

function Connection({ label, dotClass }: { label: string; dotClass: string | null }) {
  return (
    <span className="flex items-center gap-2 text-sm text-slate-300" data-status-connection>
      {dotClass && <span aria-hidden="true" className={`size-2 rounded-full ${dotClass}`} />}
      {label}
    </span>
  )
}

function NaturalConnection({ runtime }: { runtime: NaturalRuntime }) {
  const { health } = useSyncExternalStore(runtime.store.subscribe, runtime.store.getState)
  const { label, dotClass } = TELEMETRY_HEALTH[health]
  return <Connection label={runtime.isSimulated ? `Simulated data: ${label}` : label} dotClass={dotClass} />
}

function ArtificialConnection({ runtime }: { runtime: ArtificialRuntime }) {
  const { inputs } = runtime
  const kind = useSyncExternalStore(inputs.subscribeToKind, inputs.getKind)
  const source = inputs.transmitterSource
  const { health } = useSyncExternalStore(source.subscribeToStatus, source.getStatus)

  // The keyboard has no link to report, so no indicator is shown that could suggest one.
  if (kind === 'keyboard') return <Connection label="Keyboard input" dotClass={null} />

  const { label, dotClass } = TRANSMITTER_HEALTH[health]
  return <Connection label={`Transmitter: ${label}`} dotClass={dotClass} />
}

export function TopStatusBar() {
  const { activeMode } = useOperatingMode()
  const runtime = useModeRuntime()
  const { isSupported, isFullscreen, toggleFullscreen } = useFullscreen()

  return (
    <header className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
      <div
        className="glass pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl px-4 py-2"
        data-shell-ui
      >
        <h1 className="text-base font-semibold tracking-tight">Adaptable and Modular Drone</h1>
        <span className="text-sm font-medium text-accent" data-status-mode>
          {modeRegistry[activeMode].metadata.title}
        </span>
        {modeRegistry[activeMode].metadata.underDevelopment && <UnderDevelopmentBadge />}
        {runtime?.mode === 'natural' && <NaturalConnection runtime={runtime} />}
        {runtime?.mode === 'artificial' && <ArtificialConnection runtime={runtime} />}
      </div>
      {isSupported && (
        <button
          type="button"
          className="glass pointer-events-auto flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors hover:text-accent"
          data-shell-ui
          data-fullscreen-button
          aria-pressed={isFullscreen}
          onClick={() => void toggleFullscreen()}
        >
          {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </button>
      )}
    </header>
  )
}
