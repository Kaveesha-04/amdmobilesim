import { useTelemetryState } from '../../hooks/useTelemetryState'
import type { TelemetryStore } from '../../stores/telemetryStore'
import { HEALTH_DISPLAY } from './telemetryDisplay'

interface TelemetryPanelProps {
  store: TelemetryStore
  /** Where the data comes from, or null if there is no source. */
  sourceName: string | null
  isSimulated: boolean
}

const formatAngle = (degrees: number | undefined) =>
  degrees === undefined ? '—' : `${degrees.toFixed(1)}°`

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export function TelemetryPanel({ store, sourceName, isSimulated }: TelemetryPanelProps) {
  const { health, sample, lastReceivedAt, invalidReason } = useTelemetryState(store)
  const { label, dotClass } = HEALTH_DISPLAY[health]
  const isLive = health === 'live'

  const angles = [
    { name: 'Roll', value: sample?.roll },
    { name: 'Pitch', value: sample?.pitch },
    { name: 'Yaw', value: sample?.yaw },
  ]

  return (
    <section
      aria-label="Telemetry"
      className="glass-section"
      data-health={health}
    >
      <div className="flex items-center gap-2.5" role="status">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${dotClass}`} />
        <h2 className="text-sm font-semibold">{label}</h2>
        {isSimulated && (
          <span className="ml-auto rounded-full bg-warn px-2 py-0.5 text-xs font-semibold text-slate-950">
            Simulated
          </span>
        )}
      </div>

      {invalidReason && (
        <p className="mt-2 text-sm text-red-300">Reading rejected: {invalidReason}.</p>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-3">
        {angles.map(({ name, value }) => (
          <div key={name}>
            <dt className="text-xs text-slate-400">{name}</dt>
            <dd
              className={`text-xl font-semibold tabular-nums ${isLive ? 'text-slate-100' : 'text-slate-500'}`}
              data-angle={name.toLowerCase()}
            >
              {formatAngle(value)}
            </dd>
          </div>
        ))}
      </dl>
      {sample && !isLive && <p className="mt-2 text-xs text-slate-400">Last valid values, not live.</p>}

      <dl className="mt-4 space-y-1 border-t border-white/10 pt-3 text-xs">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Last update</dt>
          <dd className="tabular-nums" data-last-update>
            {lastReceivedAt === null ? 'None received' : timeFormat.format(lastReceivedAt)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-400">Source</dt>
          <dd>{sourceName ?? 'None configured'}</dd>
        </div>
      </dl>
    </section>
  )
}
