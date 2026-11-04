import { useSyncExternalStore } from 'react'
import type { TransmitterInputSource } from '../../services/flightInput/TransmitterInputSource'
import type { ServerStatus, TransmitterChannel, TransmitterHealth } from '../../types/transmitter'

const HEALTH_DISPLAY: Record<TransmitterHealth, { label: string; dotClass: string }> = {
  connected: { label: 'Connected', dotClass: 'bg-emerald-400' },
  waiting: { label: 'Waiting for data', dotClass: 'bg-sky-400' },
  disconnected: { label: 'Disconnected', dotClass: 'bg-slate-500' },
  'signal-lost': { label: 'Signal lost', dotClass: 'bg-amber-400' },
  invalid: { label: 'Invalid data', dotClass: 'bg-red-500' },
}

const SERVER_LABEL: Record<ServerStatus, string> = {
  connecting: 'Connecting…',
  connected: 'Connected',
  disconnected: 'Disconnected',
}

const CHANNELS: { channel: TransmitterChannel; label: string }[] = [
  { channel: 'throttle', label: 'Throttle' },
  { channel: 'roll', label: 'Roll' },
  { channel: 'pitch', label: 'Pitch' },
  { channel: 'yaw', label: 'Yaw' },
]

const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

function Row({ label, value, name }: { label: string; value: string; name: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right tabular-nums" data-tx={name}>
        {value}
      </dd>
    </div>
  )
}

interface TransmitterPanelProps {
  source: TransmitterInputSource
  /** Why calibration can't be used, or null if it's set. */
  calibrationError: string | null
  staleAfterMs: number
}

export function TransmitterPanel({ source, calibrationError, staleAfterMs }: TransmitterPanelProps) {
  const { state, health, controls } = useSyncExternalStore(source.subscribeToStatus, source.getStatus)
  const { serverStatus, raw, problem, dataAgeMs } = state
  const { label, dotClass } = HEALTH_DISPLAY[health]

  // Whether the receiver's answers are trustworthy says nothing about the radio link beyond them.
  const nrfLabel = serverStatus !== 'connected' || !raw ? 'Unknown' : raw.nrfOk ? 'OK' : 'Down'

  let freshness = 'No data yet'
  if (dataAgeMs !== null) {
    const seconds = `${(dataAgeMs / 1000).toFixed(1)} s old`
    freshness = dataAgeMs > staleAfterMs ? `Stale, ${seconds}` : `Fresh, ${seconds}`
  }

  return (
    <section
      aria-label="Transmitter"
      className="rounded-lg border border-slate-800 bg-slate-900 p-4"
      data-tx-health={health}
    >
      <div className="flex items-center gap-2.5" role="status">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${dotClass}`} />
        <h2 className="text-sm font-semibold">Transmitter: {label}</h2>
      </div>
      {problem && (
        <p className="mt-2 text-sm text-amber-300" data-tx="problem">
          {problem}.
        </p>
      )}
      {calibrationError && (
        <p className="mt-2 text-sm text-red-300" data-tx="calibration">
          {calibrationError}. Flying by transmitter is off until it is set. See .env.example.
        </p>
      )}

      <dl className="mt-3 space-y-1 text-xs">
        <Row label="Node.js server" value={SERVER_LABEL[serverStatus]} name="server" />
        <Row label="NRF link" value={nrfLabel} name="nrf" />
        <Row
          label="Last received"
          value={raw && dataAgeMs !== null ? timeFormat.format(raw.timestamp) : 'None'}
          name="received"
        />
        <Row label="Freshness" value={freshness} name="freshness" />
      </dl>

      <table className="mt-3 w-full border-t border-slate-800 text-xs">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="pt-2 font-normal">Channel</th>
            <th className="pt-2 text-right font-normal">Raw</th>
            <th className="pt-2 text-right font-normal">Output</th>
          </tr>
        </thead>
        <tbody>
          {CHANNELS.map(({ channel, label: channelLabel }) => (
            <tr key={channel}>
              <td className="pt-1">{channelLabel}</td>
              <td className="pt-1 text-right tabular-nums" data-tx={`raw-${channel}`}>
                {raw ? raw[channel] : '—'}
              </td>
              <td className="pt-1 text-right tabular-nums" data-tx={`out-${channel}`}>
                {controls ? `${Math.round(controls[channel] * 100)}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
