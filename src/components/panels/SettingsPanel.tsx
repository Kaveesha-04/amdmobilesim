import { useSyncExternalStore } from 'react'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import { useFullscreen } from '../../hooks/useFullscreen'
import { setDisplayPreferences, type GraphicsQuality } from '../../stores/displayPreferences'
import type { FlightStore } from '../../stores/flightStore'
import { Choice, PanelHeading, PanelText } from './PanelParts'

const QUALITY_OPTIONS: { value: GraphicsQuality; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'performance', label: 'Performance' },
]

export function SettingsPanel({ store }: { store: FlightStore }) {
  const { cameraMode } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const { graphicsQuality, reduceGlass } = useDisplayPreferences()
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
        <PanelText>Lower quality draws fewer pixels, for a smoother picture on a slower device.</PanelText>
      </section>

      <section className="space-y-2">
        <PanelHeading>Camera</PanelHeading>
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
      </section>

      <section className="space-y-3">
        <PanelHeading>Display</PanelHeading>
        <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-300">
          Reduce visual effects
          <input
            type="checkbox"
            className="size-5 cursor-pointer accent-accent"
            data-setting="reduce-glass"
            checked={reduceGlass}
            onChange={(event) => setDisplayPreferences({ reduceGlass: event.target.checked })}
          />
        </label>
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
