import { useSyncExternalStore, type ReactNode } from 'react'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import { useFullscreen } from '../../hooks/useFullscreen'
import { usePanels } from '../../hooks/usePanels'
import { setDisplayPreferences } from '../../stores/displayPreferences'
import type { FlightStore } from '../../stores/flightStore'
import type { PanelId } from '../../stores/PanelContext'
import type { FlightMode } from '../../types/flight'
import { EnterFullscreenIcon, ExitFullscreenIcon, HelpIcon, SettingsIcon } from './Icons'

const MODE_DISPLAY: Record<FlightMode, { label: string; dotClass: string }> = {
  DISARMED: { label: 'Motors off', dotClass: 'bg-slate-500' },
  ARMED: { label: 'Armed', dotClass: 'bg-warn' },
  FLYING: { label: 'Flying', dotClass: 'bg-emerald-400' },
  LANDING: { label: 'Landing', dotClass: 'bg-sky-400' },
}

function FlightStatus({ store }: { store: FlightStore }) {
  const { mode, altitude, horizontalSpeed } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const { label, dotClass } = MODE_DISPLAY[mode]

  return (
    <div className="glass pointer-events-auto rounded-2xl px-3 py-1.5" data-shell-ui data-flight-mode={mode}>
      <p className="flex items-center gap-2 text-sm font-semibold" role="status">
        <span aria-hidden="true" className={`size-2 rounded-full ${dotClass}`} />
        {label}
      </p>
      <p className="text-xs text-slate-300 tabular-nums" data-flight-readout>
        {altitude.toFixed(1)} m · {horizontalSpeed.toFixed(1)} m/s
      </p>
    </div>
  )
}

/** Turns the speed indicators drawn on the drone on or off. */
function MotorIndicatorSwitch() {
  const { showMotorIndicators } = useDisplayPreferences()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={showMotorIndicators}
      aria-label="Motor indicators"
      className="glass top-bar-button gap-2 px-3 text-sm font-medium"
      data-motor-indicators-toggle
      onClick={() => setDisplayPreferences({ showMotorIndicators: !showMotorIndicators })}
    >
      Motors
      <span
        aria-hidden="true"
        className={`relative h-5 w-9 rounded-full transition-colors duration-150 ${showMotorIndicators ? 'bg-accent' : 'bg-white/20'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-slate-50 transition-transform duration-150 ${showMotorIndicators ? 'translate-x-4' : ''}`}
        />
      </span>
    </button>
  )
}

function PanelButton({ panel, label, children }: { panel: PanelId; label: string; children: ReactNode }) {
  const { openPanel, togglePanel } = usePanels()

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={openPanel === panel}
      className="glass top-bar-button w-[42px] aria-pressed:text-accent"
      data-nav={panel}
      onClick={() => togglePanel(panel)}
    >
      {children}
    </button>
  )
}

export function TopStatusBar({ store }: { store: FlightStore }) {
  const { isSupported, isFullscreen, toggleFullscreen } = useFullscreen()

  return (
    <header className="top-status-bar pointer-events-none absolute flex items-start justify-between gap-2">
      <div className="flex min-w-0 items-center gap-3">
        <FlightStatus store={store} />
        <h1 className="hidden text-base font-semibold tracking-tight [text-shadow:0_1px_6px_rgb(2_6_23)] lg:block">
          Adaptable and Modular Drone
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-1.5" data-shell-ui>
        <MotorIndicatorSwitch />
        <PanelButton panel="settings" label="Settings">
          <SettingsIcon />
        </PanelButton>
        <PanelButton panel="help" label="Help">
          <HelpIcon />
        </PanelButton>
        {isSupported && (
          <button
            type="button"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-pressed={isFullscreen}
            className="glass top-bar-button w-[42px]"
            data-fullscreen-button
            onClick={() => void toggleFullscreen()}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
          </button>
        )}
      </div>
    </header>
  )
}
