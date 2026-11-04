import { useSyncExternalStore } from 'react'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import { useFullscreen } from '../../hooks/useFullscreen'
import { useModeRuntime } from '../../hooks/useModeRuntime'
import { setDisplayPreferences, type GraphicsQuality } from '../../stores/displayPreferences'
import type { ArtificialRuntime } from '../../stores/ModeRuntimeContext'
import { Choice, PanelHeading, PanelText } from './PanelParts'

const QUALITY_OPTIONS: { value: GraphicsQuality; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'performance', label: 'Performance' },
]

function FlightCamera({ runtime }: { runtime: ArtificialRuntime }) {
  const { store } = runtime
  const { cameraMode } = useSyncExternalStore(store.subscribe, store.getSnapshot)

  return (
    <Choice
      label="Camera"
      name="camera"
      value={cameraMode}
      options={[
        { value: 'follow', label: 'Follow' },
        { value: 'free', label: 'Free' },
      ]}
      onChange={(next) => {
        if (next !== cameraMode) store.command('toggle-camera')
      }}
    />
  )
}

function Toggle({
  label,
  name,
  checked,
  onChange,
}: {
  label: string
  name: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-300">
      {label}
      <input
        type="checkbox"
        className="size-5 cursor-pointer accent-accent"
        data-setting={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  )
}

export function SettingsPanel() {
  const runtime = useModeRuntime()
  const { graphicsQuality, reduceGlass, showFlightReadout } = useDisplayPreferences()
  const { isSupported, isFullscreen, toggleFullscreen } = useFullscreen()

  return (
    <>
      <section className="space-y-2">
        <PanelHeading>Graphics</PanelHeading>
        <Choice
          label="Quality"
          name="quality"
          value={graphicsQuality}
          options={QUALITY_OPTIONS}
          onChange={(next) => setDisplayPreferences({ graphicsQuality: next })}
        />
        <PanelText>Lower quality draws fewer pixels, for a smoother picture on a slower laptop.</PanelText>
      </section>

      <section className="space-y-2">
        <PanelHeading>Camera</PanelHeading>
        {runtime?.mode === 'artificial' ? (
          <FlightCamera runtime={runtime} />
        ) : (
          <PanelText>Drag the scene to look around, and scroll to zoom.</PanelText>
        )}
      </section>

      <section className="space-y-3">
        <PanelHeading>Display</PanelHeading>
        <Toggle
          label="Reduce glass effects"
          name="reduce-glass"
          checked={reduceGlass}
          onChange={(next) => setDisplayPreferences({ reduceGlass: next })}
        />
        <Toggle
          label="Show flight readout on screen"
          name="flight-readout"
          checked={showFlightReadout}
          onChange={(next) => setDisplayPreferences({ showFlightReadout: next })}
        />
        {isSupported && (
          <button
            type="button"
            className="glass-button w-full"
            data-setting="fullscreen"
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          </button>
        )}
      </section>
    </>
  )
}
