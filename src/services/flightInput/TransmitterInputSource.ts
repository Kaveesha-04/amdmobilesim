import type { FlightControls } from '../../types/flight'
import type {
  TransmitterCalibration,
  TransmitterHealth,
  TransmitterState,
} from '../../types/transmitter'
import { normalizeControls } from '../transmitter/calibration'
import type { TransmitterService } from '../transmitter/transmitterService'
import type { FlightInputEvent, FlightInputSource } from './FlightInputSource'

const NEUTRAL: FlightControls = { throttle: 0, roll: 0, pitch: 0, yaw: 0 }

export interface TransmitterStatus {
  state: TransmitterState
  /** As in the state, except that values which fail calibration make it 'invalid'. */
  health: TransmitterHealth
  /** The normalized inputs, or null when there are none that can be trusted. */
  controls: FlightControls | null
  /** Why the transmitter can't be flown with right now, or null if it can. */
  fault: string | null
}

const sameControls = (a: FlightControls | null, b: FlightControls | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.throttle === b.throttle &&
    a.roll === b.roll &&
    a.pitch === b.pitch &&
    a.yaw === b.yaw)

/** Adapts the receiver's data for the flight controller, and never passes on anything doubtful. */
export class TransmitterInputSource implements FlightInputSource {
  readonly name = 'Transmitter'

  private readonly service: TransmitterService
  private readonly calibration: TransmitterCalibration | null
  private readonly calibrationError: string | null
  private readonly listeners = new Set<(event: FlightInputEvent) => void>()
  private readonly statusListeners = new Set<() => void>()
  private unsubscribeFromService: (() => void) | null = null
  private status: TransmitterStatus

  constructor(
    service: TransmitterService,
    calibration: TransmitterCalibration | null,
    calibrationError: string | null,
  ) {
    this.service = service
    this.calibration = calibration
    this.calibrationError = calibrationError
    this.status = this.createStatus()
  }

  start() {
    if (this.unsubscribeFromService) return
    this.unsubscribeFromService = this.service.subscribe(this.update)
    this.service.start()
  }

  stop() {
    this.unsubscribeFromService?.()
    this.unsubscribeFromService = null
    this.service.stop()
    this.update()
  }

  read(): FlightControls {
    return this.status.fault === null && this.status.controls ? this.status.controls : NEUTRAL
  }

  /** The throttle is a physical stick, so only the person holding it can lower it. */
  resetThrottle() {}

  isActive() {
    const { throttle, roll, pitch, yaw } = this.read()
    return throttle !== 0 || roll !== 0 || pitch !== 0 || yaw !== 0
  }

  getFault() {
    return this.status.fault
  }

  getStatus = () => this.status

  subscribeToStatus = (listener: () => void) => {
    this.statusListeners.add(listener)
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  subscribe(listener: (event: FlightInputEvent) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private createStatus(): TransmitterStatus {
    const state = this.service.getState()

    if (state.health !== 'connected') {
      const fallback: Record<TransmitterHealth, string> = {
        disconnected: 'The receiver is not connected',
        waiting: 'Waiting for transmitter data',
        connected: '',
        'signal-lost': 'Transmitter signal lost',
        invalid: 'Invalid transmitter data',
      }
      return {
        state,
        health: state.health,
        controls: null,
        fault: state.problem ?? fallback[state.health],
      }
    }

    if (!this.calibration || !state.raw) {
      return { state, health: state.health, controls: null, fault: this.calibrationError }
    }

    const result = normalizeControls(state.raw, this.calibration)
    return result.valid
      ? { state, health: 'connected', controls: result.controls, fault: null }
      : { state, health: 'invalid', controls: null, fault: result.reason }
  }

  private update = () => {
    const previous = this.status
    this.status = this.createStatus()
    this.statusListeners.forEach((listener) => listener())

    // The data's age changes on every answer, but that alone gives the simulation nothing to do.
    if (
      this.status.fault !== previous.fault ||
      !sameControls(this.status.controls, previous.controls)
    ) {
      this.listeners.forEach((listener) => listener({ type: 'activity' }))
    }
  }
}
