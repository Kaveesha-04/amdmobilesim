import { useSyncExternalStore } from 'react'
import type { FlightStore } from '../../stores/flightStore'
import type { FlightMode } from '../../types/flight'

const MODE_STYLE: Record<FlightMode, { label: string; dotClass: string }> = {
  DISARMED: { label: 'Disarmed', dotClass: 'bg-slate-500' },
  ARMED: { label: 'Armed', dotClass: 'bg-amber-400' },
  FLYING: { label: 'Flying', dotClass: 'bg-emerald-400' },
  LANDING: { label: 'Landing', dotClass: 'bg-sky-400' },
}

const KEYS = [
  ['W / S', 'Pitch forward / back'],
  ['A / D', 'Roll left / right'],
  ['Q / E', 'Yaw left / right'],
  ['↑ / ↓', 'Throttle up / down'],
  ['Enter', 'Arm'],
  ['Space', 'Emergency stop / disarm'],
  ['R', 'Reset'],
  ['C', 'Switch camera'],
]

const BUTTON_CLASS =
  'rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium hover:bg-slate-800'

const percent = (value: number) => `${Math.round(value * 100)}%`
const metres = (value: number) => `${value.toFixed(2)} m`
const speed = (value: number) => `${value.toFixed(1)} m/s`

function Reading({ label, value, name }: { label: string; value: string; name: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="tabular-nums" data-reading={name}>
        {value}
      </dd>
    </div>
  )
}

/** A bar growing from the centre, for inputs that run from -1 to +1. */
function InputBar({ label, value, name }: { label: string; value: number; name: string }) {
  const width = Math.abs(value) * 50
  const left = value < 0 ? 50 - width : 50

  return (
    <div className="text-xs">
      <div className="flex justify-between text-slate-300">
        {label}
        <span className="tabular-nums" data-reading={name}>
          {percent(value)}
        </span>
      </div>
      <div className="relative mt-1 h-1.5 rounded-full bg-slate-800">
        <div
          className="absolute h-full rounded-full bg-amber-400"
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export function FlightHud({ store }: { store: FlightStore }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const { mode, controls, position, message, cameraMode, isAtBoundary } = snapshot
  const { label, dotClass } = MODE_STYLE[mode]
  const isArmed = mode !== 'DISARMED'

  return (
    <section
      aria-label="Flight data"
      className="rounded-lg border border-slate-800 bg-slate-900 p-4"
      data-flight-mode={mode}
    >
      <div className="flex items-center gap-2.5" role="status">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${dotClass}`} />
        <h2 className="text-sm font-semibold">{label}</h2>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${isArmed ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
          data-reading="armed"
        >
          Motors {isArmed ? 'armed' : 'off'}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-400">Virtual drone only. Nothing is sent to hardware.</p>

      {message && (
        <p className="mt-2 text-sm text-amber-300" data-reading="message">
          {message}
        </p>
      )}
      {isAtBoundary && (
        <p className="mt-2 text-sm text-amber-300" data-reading="boundary">
          At the edge of the flight area.
        </p>
      )}

      <div className="mt-4 space-y-2">
        <div className="text-xs">
          <div className="flex justify-between text-slate-300">
            Throttle
            <span className="tabular-nums" data-reading="throttle">
              {percent(controls.throttle)}
            </span>
          </div>
          <div className="relative mt-1 h-1.5 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-amber-400"
              style={{ width: percent(controls.throttle) }}
            />
            {/* The drone hovers at half throttle. */}
            <div className="absolute top-0 left-1/2 h-full w-px bg-slate-300" />
          </div>
        </div>
        <InputBar label="Roll" value={controls.roll} name="roll" />
        <InputBar label="Pitch" value={controls.pitch} name="pitch" />
        <InputBar label="Yaw" value={controls.yaw} name="yaw" />
      </div>

      <dl className="mt-4 space-y-1 border-t border-slate-800 pt-3 text-xs">
        <Reading label="Altitude" value={metres(snapshot.altitude)} name="altitude" />
        <Reading label="Horizontal speed" value={speed(snapshot.horizontalSpeed)} name="horizontal-speed" />
        <Reading label="Vertical speed" value={speed(snapshot.verticalSpeed)} name="vertical-speed" />
        <Reading
          label="Position (X, Y, Z)"
          value={`${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)} m`}
          name="position"
        />
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() => store.command(isArmed ? 'disarm' : 'arm')}
        >
          {isArmed ? 'Disarm' : 'Arm'}
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => store.command('reset')}>
          Reset
        </button>
        <button type="button" className={BUTTON_CLASS} onClick={() => store.command('toggle-camera')}>
          {cameraMode === 'follow' ? 'Use free camera' : 'Use follow camera'}
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-slate-800 pt-3 text-xs">
        {KEYS.map(([key, action]) => (
          <div key={key} className="contents">
            <dt className="font-mono text-slate-300">{key}</dt>
            <dd className="text-slate-400">{action}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
