import type { FlightInputEvent, FlightInputSource } from './FlightInputSource'
import type { KeyboardInputSource } from './KeyboardInputSource'
import type { TransmitterInputSource } from './TransmitterInputSource'

export type InputKind = 'keyboard' | 'transmitter'

/**
 * The one input source the simulation sees, passing on whichever device is selected.
 *
 * The keyboard always stays attached for arming, disarming, reset and the camera,
 * because the transmitter has no channels for them. With the transmitter selected
 * its flight keys are switched off, and the receiver is polled only in that case.
 */
export class InputController implements FlightInputSource {
  private readonly keyboard: KeyboardInputSource
  private readonly transmitter: TransmitterInputSource
  private readonly listeners = new Set<(event: FlightInputEvent) => void>()
  private readonly kindListeners = new Set<() => void>()
  private kind: InputKind = 'keyboard'
  private unsubscribes: (() => void)[] = []

  constructor(keyboard: KeyboardInputSource, transmitter: TransmitterInputSource) {
    this.keyboard = keyboard
    this.transmitter = transmitter
  }

  get name() {
    return this.active().name
  }

  /** Only the transmitter itself, for its status panel. */
  get transmitterSource() {
    return this.transmitter
  }

  start() {
    if (this.unsubscribes.length > 0) return
    const emit = (event: FlightInputEvent) => this.listeners.forEach((listener) => listener(event))
    this.unsubscribes = [this.keyboard.subscribe(emit), this.transmitter.subscribe(emit)]
    this.keyboard.start()
    if (this.kind === 'transmitter') this.transmitter.start()
  }

  stop() {
    this.unsubscribes.forEach((unsubscribe) => unsubscribe())
    this.unsubscribes = []
    this.keyboard.stop()
    this.transmitter.stop()
  }

  /** The simulation should allow this only while the drone is disarmed on the ground. */
  select(kind: InputKind) {
    if (kind === this.kind) return
    this.kind = kind

    this.keyboard.setFlightKeysEnabled(kind === 'keyboard')
    if (kind === 'transmitter') this.transmitter.start()
    else this.transmitter.stop()

    this.kindListeners.forEach((listener) => listener())
    this.listeners.forEach((listener) => listener({ type: 'activity' }))
  }

  getKind = () => this.kind

  subscribeToKind = (listener: () => void) => {
    this.kindListeners.add(listener)
    return () => {
      this.kindListeners.delete(listener)
    }
  }

  read(deltaSeconds: number) {
    return this.active().read(deltaSeconds)
  }

  resetThrottle() {
    this.active().resetThrottle()
  }

  isActive() {
    return this.active().isActive()
  }

  getFault() {
    return this.active().getFault()
  }

  subscribe(listener: (event: FlightInputEvent) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private active(): FlightInputSource {
    return this.kind === 'keyboard' ? this.keyboard : this.transmitter
  }
}
