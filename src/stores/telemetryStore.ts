import { TELEMETRY_CONFIG } from '../config/telemetry'
import type { TelemetryEvent, TelemetryProvider } from '../services/telemetry/TelemetryProvider'
import { validateTelemetry } from '../services/telemetry/validateTelemetry'
import type { ConnectionStatus, TelemetryHealth, TelemetryState } from '../types/telemetry'

const STALE_CHECK_INTERVAL_MS = 250

const INITIAL_STATE: TelemetryState = {
  health: 'disconnected',
  sample: null,
  lastReceivedAt: null,
  invalidReason: null,
}

const HEALTH_FOR_STATUS: Record<ConnectionStatus, TelemetryHealth> = {
  disconnected: 'disconnected',
  connecting: 'connecting',
  connected: 'waiting',
}

/**
 * Turns a provider's events into the state the interface reads. It lives outside
 * React so that the 3D scene can follow it without re-rendering at the telemetry
 * rate. Pass null for the provider when no telemetry source is available.
 */
export class TelemetryStore {
  private state = INITIAL_STATE
  private readonly listeners = new Set<() => void>()
  private readonly provider: TelemetryProvider | null
  private unsubscribeFromProvider: (() => void) | null = null
  private staleTimer: ReturnType<typeof setInterval> | undefined
  private lastMessageAt = 0

  constructor(provider: TelemetryProvider | null) {
    this.provider = provider
  }

  start() {
    if (!this.provider || this.unsubscribeFromProvider) return
    this.unsubscribeFromProvider = this.provider.subscribe(this.handleEvent)
    this.staleTimer = setInterval(this.checkForStaleData, STALE_CHECK_INTERVAL_MS)
    this.provider.connect()
  }

  /** Stops all telemetry work, so that nothing runs once the mode has been left. */
  stop() {
    if (!this.unsubscribeFromProvider) return
    clearInterval(this.staleTimer)
    this.unsubscribeFromProvider()
    this.unsubscribeFromProvider = null
    this.provider?.disconnect()
    this.setState(INITIAL_STATE)
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getState = () => this.state

  private setState(next: TelemetryState) {
    this.state = next
    this.listeners.forEach((listener) => listener())
  }

  private handleEvent = (event: TelemetryEvent) => {
    if (event.type === 'status') {
      this.setState({
        ...this.state,
        health: HEALTH_FOR_STATUS[event.status],
        invalidReason: null,
      })
      return
    }

    // A reading can't be trusted without a link, whatever the provider sends.
    const { health } = this.state
    if (health === 'disconnected' || health === 'connecting') return

    const now = Date.now()
    this.lastMessageAt = now
    const result = validateTelemetry(event.sample)

    if (result.valid) {
      this.setState({
        health: 'live',
        sample: result.sample,
        lastReceivedAt: now,
        invalidReason: null,
      })
    } else {
      this.setState({ ...this.state, health: 'invalid', invalidReason: result.reason })
    }
  }

  private checkForStaleData = () => {
    const { health } = this.state
    if (
      (health === 'live' || health === 'invalid') &&
      Date.now() - this.lastMessageAt > TELEMETRY_CONFIG.staleAfterMs
    ) {
      this.setState({ ...this.state, health: 'stale', invalidReason: null })
    }
  }
}
