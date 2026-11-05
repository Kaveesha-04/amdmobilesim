import { useState, useSyncExternalStore, type FormEvent } from 'react'
import type { TransmitterInputSource } from '../../services/flightInput/TransmitterInputSource'
import {
  clearSavedReceiverUrl,
  parseReceiverUrl,
  saveReceiverUrl,
} from '../../services/transmitter/receiverUrl'
import type { FlightStore } from '../../stores/flightStore'
import type { ServerStatus, TransmitterChannel, TransmitterHealth } from '../../types/transmitter'

export const HEALTH_DISPLAY: Record<TransmitterHealth, { label: string; dotClass: string }> = {
  connected: { label: 'Connected', dotClass: 'bg-emerald-400' },
  waiting: { label: 'Waiting for data', dotClass: 'bg-sky-400' },
  disconnected: { label: 'Disconnected', dotClass: 'bg-slate-500' },
  'signal-lost': { label: 'Signal lost', dotClass: 'bg-warn' },
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

const FORM_BUTTON_CLASS = 'glass-button'

interface ReceiverAddressFormProps {
  source: TransmitterInputSource
  store: FlightStore
  /** What "Use default" goes back to. */
  configuredUrl: string
}

/** Only for the web app's own connection. The ESP32 has its own address for the receiver, in its firmware. */
function ReceiverAddressForm({ source, store, configuredUrl }: ReceiverAddressFormProps) {
  const { receiverUrl } = useSyncExternalStore(source.subscribeToStatus, source.getStatus)
  // Subscribing keeps the lock up to date as the drone arms, flies and lands.
  useSyncExternalStore(store.subscribe, store.getSnapshot)
  const isLocked = !store.canChangeInput()

  const [draft, setDraft] = useState(receiverUrl)
  const [error, setError] = useState<string | null>(null)

  const apply = (event: FormEvent) => {
    event.preventDefault()
    const result = parseReceiverUrl(draft)
    if (!result.valid) {
      setError(result.reason)
      return
    }
    setError(null)
    setDraft(result.url)
    saveReceiverUrl(result.url)
    source.setReceiverUrl(result.url)
  }

  const resetToDefault = () => {
    setError(null)
    setDraft(configuredUrl)
    clearSavedReceiverUrl()
    source.setReceiverUrl(configuredUrl)
  }

  return (
    <form className="mt-3 border-t border-white/10 pt-3 text-xs" onSubmit={apply}>
      <label className="block text-slate-400">
        Receiver address
        <input
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-md border border-white/15 bg-slate-950/60 px-2 py-1.5 text-slate-100 disabled:opacity-50"
          value={draft}
          disabled={isLocked}
          data-tx="address-input"
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <div className="mt-2 flex gap-2">
        <button type="submit" className={FORM_BUTTON_CLASS} disabled={isLocked}>
          Apply
        </button>
        <button type="button" className={FORM_BUTTON_CLASS} disabled={isLocked} onClick={resetToDefault}>
          Use default
        </button>
      </div>
      {error && (
        <p className="mt-2 text-red-300" data-tx="address-error">
          {error}.
        </p>
      )}
      <p className="mt-2 text-slate-400" data-tx="address">
        In use: {receiverUrl}
      </p>
      {isLocked && <p className="mt-1 text-slate-400">Disarm and land to change the address.</p>}
    </form>
  )
}

interface TransmitterPanelProps {
  source: TransmitterInputSource
  store: FlightStore
  configuredUrl: string
  staleAfterMs: number
}

export function TransmitterPanel({
  source,
  store,
  configuredUrl,
  staleAfterMs,
}: TransmitterPanelProps) {
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
      className="glass-section"
      data-tx-health={health}
    >
      <div className="flex items-center gap-2.5" role="status">
        <span aria-hidden="true" className={`size-2.5 rounded-full ${dotClass}`} />
        <h2 className="text-sm font-semibold">Transmitter: {label}</h2>
      </div>
      {problem && (
        <p className="mt-2 text-sm text-warn" data-tx="problem">
          {problem}.
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

      <table className="mt-3 w-full border-t border-white/10 text-xs">
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

      <ReceiverAddressForm source={source} store={store} configuredUrl={configuredUrl} />
    </section>
  )
}
