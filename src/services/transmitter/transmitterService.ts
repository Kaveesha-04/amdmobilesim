import type { RawTransmitterData, TransmitterState } from '../../types/transmitter'

export interface TransmitterServiceOptions {
  receiverUrl: string
  pollIntervalMs: number
  requestTimeoutMs: number
  staleAfterMs: number
}

const INITIAL_STATE: TransmitterState = {
  serverStatus: 'connecting',
  health: 'disconnected',
  raw: null,
  problem: null,
  dataAgeMs: null,
}

type ValidationResult = { valid: true; raw: RawTransmitterData } | { valid: false; reason: string }

const CHANNELS = ['throttle', 'roll', 'pitch', 'yaw'] as const

/** Accepts only the receiver's documented shape. It stores whatever the ESP32 posted, so check it all. */
export function validateTransmitterData(data: unknown): ValidationResult {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, reason: 'The response is not an object' }
  }

  const fields = data as Record<string, unknown>

  for (const channel of CHANNELS) {
    const value = fields[channel]
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { valid: false, reason: `${channel} is missing or not a number` }
    }
  }
  if (typeof fields.nrf_ok !== 'boolean') {
    return { valid: false, reason: 'nrf_ok is missing or not true or false' }
  }
  if (typeof fields.timestamp !== 'number' || !Number.isFinite(fields.timestamp)) {
    return { valid: false, reason: 'timestamp is missing or not a number' }
  }

  return {
    valid: true,
    raw: {
      throttle: fields.throttle as number,
      roll: fields.roll as number,
      pitch: fields.pitch as number,
      yaw: fields.yaw as number,
      nrfOk: fields.nrf_ok,
      timestamp: fields.timestamp,
    },
  }
}

/**
 * Reads the latest transmitter data from the Signal Receiver, using GET only.
 * Nothing here can send anything to the receiver, the ESP32 or the drone.
 *
 * The receiver answers with its latest values whether or not the ESP32 is still
 * sending, so an answer alone doesn't mean the data is live. It updates `timestamp`
 * for each message from the ESP32, so data counts as fresh only when that changes.
 * Comparing the change with this browser's own clock also means the two machines'
 * clocks don't have to agree.
 */
export class TransmitterService {
  private readonly options: TransmitterServiceOptions
  private readonly listeners = new Set<() => void>()
  private state = INITIAL_STATE
  /** Changes on stop, so that an answer arriving afterwards can't restart anything. */
  private run: object | null = null
  private abort: AbortController | null = null
  private nextPoll: ReturnType<typeof setTimeout> | undefined
  private lastTimestamp: number | null = null
  private lastChangeAt: number | null = null

  constructor(options: TransmitterServiceOptions) {
    this.options = options
  }

  start() {
    if (this.run) return
    this.run = {}
    this.forgetData()
    this.setState(INITIAL_STATE)
    void this.poll(this.run)
  }

  stop() {
    this.run = null
    clearTimeout(this.nextPoll)
    this.abort?.abort()
    this.abort = null
    this.forgetData()
    this.setState(INITIAL_STATE)
  }

  getState = () => this.state

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** Runs one request at a time, and schedules the next only when this one has finished. */
  private async poll(run: object) {
    const abort = new AbortController()
    this.abort = abort
    const timeout = setTimeout(() => abort.abort(), this.options.requestTimeoutMs)
    const url = `${this.options.receiverUrl.replace(/\/+$/, '')}/api/telemetry`

    try {
      const response = await fetch(url, { method: 'GET', cache: 'no-store', signal: abort.signal })
      const isCurrent = () => this.run === run

      if (!response.ok) {
        if (isCurrent()) this.handleLostServer(`The receiver answered with HTTP ${response.status}`)
      } else {
        let body: unknown
        let isJson = true
        try {
          body = await response.json()
        } catch {
          isJson = false
        }
        if (isCurrent()) {
          if (isJson) this.handleAnswer(body)
          else this.handleInvalid('The response is not valid JSON')
        }
      }
    } catch {
      if (this.run === run) this.handleLostServer('The receiver cannot be reached')
    } finally {
      clearTimeout(timeout)
    }

    if (this.run === run) {
      this.nextPoll = setTimeout(() => void this.poll(run), this.options.pollIntervalMs)
    }
  }

  private handleAnswer(body: unknown) {
    const result = validateTransmitterData(body)
    if (!result.valid) {
      this.handleInvalid(result.reason)
      return
    }

    const { raw } = result
    const now = performance.now()

    // The first answer may be old, so only a change afterwards shows that data is arriving.
    if (this.lastTimestamp !== null && raw.timestamp !== this.lastTimestamp) this.lastChangeAt = now
    this.lastTimestamp = raw.timestamp

    if (this.lastChangeAt === null) {
      this.setState({
        serverStatus: 'connected',
        health: 'waiting',
        raw,
        problem: 'No message has arrived from the ESP32 yet',
        dataAgeMs: null,
      })
      return
    }

    const dataAgeMs = now - this.lastChangeAt
    const isStale = dataAgeMs > this.options.staleAfterMs
    const problem = isStale
      ? 'The ESP32 has stopped sending'
      : raw.nrfOk
        ? null
        : 'The ESP32 reports its NRF link as down'

    this.setState({
      serverStatus: 'connected',
      health: problem ? 'signal-lost' : 'connected',
      raw,
      problem,
      dataAgeMs,
    })
  }

  private handleInvalid(reason: string) {
    this.setState({
      serverStatus: 'connected',
      health: 'invalid',
      raw: this.state.raw,
      problem: reason,
      dataAgeMs: this.state.dataAgeMs,
    })
  }

  private handleLostServer(reason: string) {
    // Fresh data has to be seen again after reconnecting, so that old values can't pass for it.
    this.forgetData()
    this.setState({
      serverStatus: 'disconnected',
      health: 'disconnected',
      raw: this.state.raw,
      problem: reason,
      dataAgeMs: null,
    })
  }

  private forgetData() {
    this.lastTimestamp = null
    this.lastChangeAt = null
  }

  private setState(next: TransmitterState) {
    this.state = next
    this.listeners.forEach((listener) => listener())
  }
}
