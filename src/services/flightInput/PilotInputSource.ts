import { THROTTLE_FULL_RANGE_SECONDS, type FlightKeyMap } from '../../config/flight'
import type { FlightCommand, FlightControls } from '../../types/flight'
import type { FlightInputEvent, FlightInputSource } from './FlightInputSource'

type KeyAction = keyof FlightKeyMap

/** The on-screen sticks, from -1 to +1. Throttle here is how fast to change it, not its level. */
export interface StickAxes {
  throttleRate: number
  roll: number
  pitch: number
  yaw: number
}

const CENTRED: StickAxes = { throttleRate: 0, roll: 0, pitch: 0, yaw: 0 }

const COMMAND_FOR_ACTION: Partial<Record<KeyAction, FlightCommand>> = {
  arm: 'arm',
  disarm: 'disarm',
  reset: 'reset',
  toggleCamera: 'toggle-camera',
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** Typing in a form must not fly the drone: "r" in a text box would otherwise reset it. */
function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/**
 * The on-screen sticks and the keyboard, as one source with one throttle. Letting go
 * of either leaves the throttle where it is, so a pilot can hold a hover hands-free.
 */
export class PilotInputSource implements FlightInputSource {
  readonly name = 'Pilot'

  private readonly actionForCode = new Map<string, KeyAction>()
  private readonly listeners = new Set<(event: FlightInputEvent) => void>()
  private readonly heldCodes = new Set<string>()
  private readonly heldActions = new Set<KeyAction>()
  private sticks = CENTRED
  private throttle = 0

  constructor(keyMap: FlightKeyMap) {
    for (const [action, codes] of Object.entries(keyMap)) {
      for (const code of codes) this.actionForCode.set(code, action as KeyAction)
    }
  }

  start() {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    // A key released while the page is out of focus never reports its release.
    window.addEventListener('blur', this.releaseAllKeys)
  }

  stop() {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    window.removeEventListener('blur', this.releaseAllKeys)
    this.releaseAllKeys()
    this.sticks = CENTRED
    this.throttle = 0
  }

  read(deltaSeconds: number): FlightControls {
    const axis = (positive: KeyAction, negative: KeyAction, stick: number) =>
      clamp(Number(this.heldActions.has(positive)) - Number(this.heldActions.has(negative)) + stick, -1, 1)

    this.throttle +=
      (axis('throttleUp', 'throttleDown', this.sticks.throttleRate) * deltaSeconds) /
      THROTTLE_FULL_RANGE_SECONDS
    this.throttle = clamp(this.throttle, 0, 1)

    return {
      throttle: this.throttle,
      roll: axis('rollRight', 'rollLeft', this.sticks.roll),
      pitch: axis('pitchForward', 'pitchBackward', this.sticks.pitch),
      yaw: axis('yawRight', 'yawLeft', this.sticks.yaw),
    }
  }

  /** For the on-screen sticks. Only the axes that a stick controls need to be given. */
  setSticks(change: Partial<StickAxes>) {
    this.sticks = { ...this.sticks, ...change }
    this.emit({ type: 'activity' })
  }

  resetThrottle() {
    this.throttle = 0
  }

  isActive() {
    return this.heldActions.size > 0 || Object.values(this.sticks).some((value) => value !== 0)
  }

  subscribe(listener: (event: FlightInputEvent) => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit(event: FlightInputEvent) {
    this.listeners.forEach((listener) => listener(event))
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    // Leave browser shortcuts such as Ctrl+R and Ctrl+W alone.
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (isTypingTarget(event.target)) return

    const action = this.actionForCode.get(event.code)
    if (!action) return

    // Stops the arrows and Space scrolling, and Space or Enter pressing a focused button.
    event.preventDefault()
    if (event.repeat) return

    const command = COMMAND_FOR_ACTION[action]
    if (command) {
      this.emit({ type: 'command', command })
      return
    }

    this.heldCodes.add(event.code)
    this.heldActions.add(action)
    this.emit({ type: 'activity' })
  }

  private handleKeyUp = (event: KeyboardEvent) => {
    const action = this.actionForCode.get(event.code)
    if (!action) return

    // Browsers press a focused button on the release of Space, not the press.
    if (!isTypingTarget(event.target)) event.preventDefault()

    if (this.heldCodes.delete(event.code)) {
      this.heldActions.clear()
      for (const code of this.heldCodes) {
        const held = this.actionForCode.get(code)
        if (held) this.heldActions.add(held)
      }
      this.emit({ type: 'activity' })
    }
  }

  private releaseAllKeys = () => {
    this.heldCodes.clear()
    this.heldActions.clear()
    this.emit({ type: 'activity' })
  }
}
