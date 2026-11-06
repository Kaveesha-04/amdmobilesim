import { useState } from 'react'
import { useTelemetryState } from '../../hooks/useTelemetryState'
import type { MockFault, MockTelemetryProvider } from '../../services/telemetry/MockTelemetryProvider'
import type { TelemetryStore } from '../../stores/telemetryStore'
import type { Attitude } from '../../types/telemetry'

const NEUTRAL: Attitude = { roll: 0, pitch: 0, yaw: 0 }

const AXES: { axis: keyof Attitude; label: string; min: number; max: number }[] = [
  { axis: 'roll', label: 'Roll', min: -180, max: 180 },
  { axis: 'pitch', label: 'Pitch', min: -90, max: 90 },
  { axis: 'yaw', label: 'Yaw', min: 0, max: 359 },
]

const FAULTS: { value: MockFault; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'not-a-number', label: 'Roll is not a number' },
  { value: 'out-of-range', label: 'Pitch out of range' },
  { value: 'missing-field', label: 'Yaw missing' },
]

const BUTTON_CLASS = 'glass-button'

interface MockTelemetryControlsProps {
  mock: MockTelemetryProvider
  store: TelemetryStore
}

/** Development only. Everything set here is simulated and has nothing to do with the real drone. */
export function MockTelemetryControls({ mock, store }: MockTelemetryControlsProps) {
  const { health } = useTelemetryState(store)
  const [attitude, setAttitude] = useState(() => mock.getSettings().attitude)
  const [isStreaming, setIsStreaming] = useState(() => mock.getSettings().isStreaming)
  const [fault, setFault] = useState<MockFault>(() => mock.getSettings().fault)

  const isDisconnected = health === 'disconnected'

  const changeStreaming = (next: boolean) => {
    mock.setStreaming(next)
    setIsStreaming(next)
  }

  const changeAttitude = (next: Attitude) => {
    mock.setAttitude(next)
    setAttitude(next)
    changeStreaming(true)
  }

  const changeFault = (next: MockFault) => {
    mock.setFault(next)
    setFault(next)
  }

  return (
    <section
      aria-label="Mock telemetry controls"
      className="glass-section !border-warn/50"
    >
      <h2 className="text-sm font-semibold text-warn">Simulated data controls</h2>
      <p className="mt-1 text-xs text-slate-400">Development only. Not connected to the real drone.</p>

      <div className="mt-3 space-y-2">
        {AXES.map(({ axis, label, min, max }) => (
          <label key={axis} className="block text-xs">
            <span className="flex justify-between text-slate-300">
              {label}
              <span className="tabular-nums">{attitude[axis]}°</span>
            </span>
            <input
              type="range"
              className="mt-1 w-full accent-warn"
              min={min}
              max={max}
              value={attitude[axis]}
              disabled={isDisconnected}
              onChange={(event) =>
                changeAttitude({ ...attitude, [axis]: event.target.valueAsNumber })
              }
            />
          </label>
        ))}
      </div>

      <label className="mt-3 block text-xs text-slate-300">
        Send bad readings
        <select
          className="mt-1 w-full rounded-md border border-white/15 bg-slate-950/60 px-2 py-1.5"
          value={fault}
          disabled={isDisconnected}
          onChange={(event) => changeFault(event.target.value as MockFault)}
        >
          {FAULTS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={BUTTON_CLASS}
          disabled={isDisconnected}
          onClick={() => {
            changeFault('none')
            changeAttitude(NEUTRAL)
          }}
        >
          Return to neutral
        </button>
        <button
          type="button"
          className={BUTTON_CLASS}
          disabled={isDisconnected}
          onClick={() => changeStreaming(!isStreaming)}
        >
          {isStreaming ? 'Pause stream' : 'Start stream'}
        </button>
        <button
          type="button"
          className={BUTTON_CLASS}
          onClick={() => (isDisconnected ? mock.connect() : mock.disconnect())}
        >
          {isDisconnected ? 'Reconnect' : 'Disconnect'}
        </button>
      </div>
    </section>
  )
}
