import { useCallback, useSyncExternalStore, type ReactNode } from 'react'
import type { PilotInputSource } from '../../services/flightInput/PilotInputSource'
import type { FlightStore } from '../../stores/flightStore'
import { VirtualStick } from './VirtualStick'

/**
 * Acts on the press itself. A browser may not report a click for a second finger
 * tapping while a thumb is on a stick, and Stop has to work exactly then. The click
 * handler is for the keyboard and screen readers, which report no pointer (detail 0).
 */
function PressButton({
  onPress,
  className,
  name,
  children,
}: {
  onPress: () => void
  className: string
  name: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={className}
      data-flight-action={name}
      onPointerDown={onPress}
      onClick={(event) => {
        if (event.detail === 0) onPress()
      }}
    >
      {children}
    </button>
  )
}

function ThrottleGauge({ store }: { store: FlightStore }) {
  const { controls } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const percent = Math.round(controls.throttle * 100)

  return (
    <div className="throttle-gauge" aria-label={`Throttle ${percent}%`} role="img" data-throttle={percent}>
      <div className="throttle-gauge-fill" style={{ height: `${percent}%` }} />
      {/* The drone hovers at half throttle. */}
      <div className="throttle-gauge-hover" />
    </div>
  )
}

function ActionButtons({ store }: { store: FlightStore }) {
  const { mode, message, cameraMode, isAtBoundary } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const isArmed = mode !== 'DISARMED'

  let hint: string | null = null
  if (mode === 'DISARMED' && !message) hint = 'Tap Start, then push the left stick up'
  else if (mode === 'ARMED') hint = 'Push the left stick up to take off'

  const notice = message ?? (isAtBoundary ? 'At the edge of the flight area' : null)

  return (
    <div className="flight-actions" data-shell-ui>
      {notice && (
        <p className="glass rounded-lg px-3 py-1 text-center text-xs text-warn" data-flight-notice role="status">
          {notice}
        </p>
      )}
      {!notice && hint && (
        <p className="glass rounded-lg px-3 py-1 text-center text-xs text-slate-200" data-flight-hint>
          {hint}
        </p>
      )}
      <PressButton
        name={isArmed ? 'stop' : 'start'}
        className={`flight-action-main ${isArmed ? 'bg-warn text-slate-950' : 'bg-accent text-slate-950'}`}
        onPress={() => store.command(isArmed ? 'disarm' : 'arm')}
      >
        {isArmed ? 'Stop' : 'Start'}
      </PressButton>
      <div className="flex gap-2">
        <PressButton name="reset" className="glass flight-action-small" onPress={() => store.command('reset')}>
          Reset
        </PressButton>
        <PressButton
          name="camera"
          className="glass flight-action-small"
          onPress={() => store.command('toggle-camera')}
        >
          {cameraMode === 'follow' ? 'Free view' : 'Follow'}
        </PressButton>
      </div>
    </div>
  )
}

/** Mode 2 layout, as on most drone controllers: climb and turn on the left, and move on the right. */
export function TouchControls({ store, pilot }: { store: FlightStore; pilot: PilotInputSource }) {
  const handleLeftStick = useCallback(
    (x: number, y: number) => pilot.setSticks({ yaw: x, throttleRate: y }),
    [pilot],
  )
  const handleRightStick = useCallback(
    (x: number, y: number) => pilot.setSticks({ roll: x, pitch: y }),
    [pilot],
  )

  return (
    <div className="flight-controls">
      <div className="flight-stick-left">
        <VirtualStick
          name="left"
          label="Left stick: up and down to climb or descend, left and right to turn"
          onChange={handleLeftStick}
        >
          <ThrottleGauge store={store} />
        </VirtualStick>
        <p className="flight-stick-caption">Climb · Turn</p>
      </div>
      <ActionButtons store={store} />
      <div className="flight-stick-right">
        <VirtualStick
          name="right"
          label="Right stick: up and down to fly forward or back, left and right to fly sideways"
          onChange={handleRightStick}
        />
        <p className="flight-stick-caption">Move</p>
      </div>
    </div>
  )
}
