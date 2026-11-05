import type { Attitude } from '../../types/telemetry'
import type { TelemetryEvent, TelemetryProvider } from './TelemetryProvider'

const SEND_INTERVAL_MS = 50
const CONNECT_DELAY_MS = 300

export type MockFault = 'none' | 'not-a-number' | 'out-of-range' | 'missing-field'

/** Simulated data for development, set by hand through the mock controls. No real drone is involved. */
export class MockTelemetryProvider implements TelemetryProvider {
  readonly name = 'Mock telemetry'
  readonly isSimulated = true

  private readonly listeners = new Set<(event: TelemetryEvent) => void>()
  private attitude: Attitude = { roll: 0, pitch: 0, yaw: 0 }
  private fault: MockFault = 'none'
  /** Off to begin with, so that the waiting state appears until the controls are used. */
  private isStreaming = false
  private connectTimer: ReturnType<typeof setTimeout> | undefined
  private sendTimer: ReturnType<typeof setInterval> | undefined

  subscribe(listener: (event: TelemetryEvent) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  connect() {
    this.stopTimers()
    this.emit({ type: 'status', status: 'connecting' })
    this.connectTimer = setTimeout(() => {
      this.emit({ type: 'status', status: 'connected' })
      this.sendTimer = setInterval(() => this.send(), SEND_INTERVAL_MS)
    }, CONNECT_DELAY_MS)
  }

  disconnect() {
    this.stopTimers()
    this.emit({ type: 'status', status: 'disconnected' })
  }

  /** The controls can close and reopen with their panel, so the settings are kept here. */
  getSettings() {
    return { attitude: this.attitude, isStreaming: this.isStreaming, fault: this.fault }
  }

  setAttitude(attitude: Attitude) {
    this.attitude = attitude
  }

  setStreaming(isStreaming: boolean) {
    this.isStreaming = isStreaming
  }

  setFault(fault: MockFault) {
    this.fault = fault
  }

  private send() {
    if (this.isStreaming) {
      this.emit({ type: 'sample', sample: this.createSample() })
    }
  }

  private createSample(): unknown {
    const sample = { ...this.attitude, timestamp: Date.now() }

    switch (this.fault) {
      case 'not-a-number':
        return { ...sample, roll: Number.NaN }
      case 'out-of-range':
        return { ...sample, pitch: 999 }
      case 'missing-field':
        return { roll: sample.roll, pitch: sample.pitch, timestamp: sample.timestamp }
      case 'none':
        return sample
    }
  }

  private emit(event: TelemetryEvent) {
    this.listeners.forEach((listener) => listener(event))
  }

  private stopTimers() {
    clearTimeout(this.connectTimer)
    clearInterval(this.sendTimer)
  }
}
