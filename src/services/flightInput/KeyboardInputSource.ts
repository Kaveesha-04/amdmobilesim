import { KEYBOARD_THROTTLE_FULL_RANGE_SECONDS, type FlightKeyMap } from '../../config/flight'
import type { FlightCommand, FlightControls } from '../../types/flight'
import type { FlightInputEvent, FlightInputSource } from './FlightInputSource'

type KeyAction = keyof FlightKeyMap

const COMMAND_FOR_ACTION: Partial<Record<KeyAction, FlightCommand>> = {
  arm: 'arm',
  disarm: 'disarm',
  reset: 'reset',
  toggleCamera: 'toggle-camera',
}

/** Typing in a form must not fly the drone: "r" in a text box would otherwise reset it. */
function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

export class KeyboardInputSource implements FlightInputSource {
  readonly name = 'Keyboard'

  private readonly actionForCode = new Map<string, KeyAction>()
  private readonly listeners = new Set<(event: FlightInputEvent) => void>()
  private readonly heldCodes = new Set<string>()
  private readonly heldActions = new Set<KeyAction>()
  private throttle = 0
  private flightKeysEnabled = true

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
    this.throttle = 0
  }

  read(deltaSeconds: number): FlightControls {
    const axis = (positive: KeyAction, negative: KeyAction) =>
      Number(this.heldActions.has(positive)) - Number(this.heldActions.has(negative))

    this.throttle +=
      (axis('throttleUp', 'throttleDown') * deltaSeconds) / KEYBOARD_THROTTLE_FULL_RANGE_SECONDS
    this.throttle = Math.min(Math.max(this.throttle, 0), 1)

    return {
      throttle: this.throttle,
      roll: axis('rollRight', 'rollLeft'),
      pitch: axis('pitchForward', 'pitchBackward'),
      yaw: axis('yawRight', 'yawLeft'),
    }
  }

  resetThrottle() {
    this.throttle = 0
  }

  isActive() {
    return this.heldActions.size > 0
  }

  /** The keyboard itself can't fail. */
  getFault() {
    return null
  }

  /** With these off, only the command keys still do anything, and the rest behave as normal. */
  setFlightKeysEnabled(isEnabled: boolean) {
    this.flightKeysEnabled = isEnabled
    this.releaseAllKeys()
    this.throttle = 0
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

    const command = COMMAND_FOR_ACTION[action]
    if (!command && !this.flightKeysEnabled) return

    // Stops the arrows and Space scrolling, and Space or Enter pressing a focused button.
    event.preventDefault()
    if (event.repeat) return

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
