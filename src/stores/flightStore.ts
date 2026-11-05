import { Quaternion, Vector3 } from 'three'
import { DRONE_GROUND_Y, FLIGHT_CONTROL, FLIGHT_PHYSICS, PROPELLERS, PROPELLER_MAX_RADIANS_PER_SECOND } from '../config/flight'
import type { FlightArea } from '../config/world'
import type { FlightInputEvent, FlightInputSource } from '../services/flightInput/FlightInputSource'
import { armingBlock, computeMotorTargets, computeSetpoint, nextFlightMode } from '../simulation/flightController'
import { createDroneState, stepPhysics, type DroneState } from '../simulation/flightPhysics'
import type { CameraMode, FlightCommand, FlightControls, FlightMode, FlightSnapshot } from '../types/flight'

const SNAPSHOT_INTERVAL_SECONDS = 0.1
/** Stands in for the time since the last frame, which is meaningless after the scene has been idle. */
const FIRST_FRAME_SECONDS = 1 / 60
const SETTLED_SPEED = 0.001
const SETTLED_DEGREES = 0.01
const SETTLED_MOTOR = 0.001

const NO_CONTROLS: FlightControls = { throttle: 0, roll: 0, pitch: 0, yaw: 0 }

/**
 * Holds the simulation and runs input, flight controller and physics in order.
 * All of it is local to Artificial Mode and advances only when the 3D scene asks,
 * so it stops when the mode's view unmounts. It lives outside React so that the
 * scene and the physics don't cause a re-render at the frame rate.
 *
 * No part of this reaches hardware: the motors here are numbers for the animation.
 */
export class FlightStore {
  /** Between the last two physics steps, for smooth motion at any frame rate. Read these to draw. */
  readonly renderPosition = new Vector3()
  readonly renderQuaternion = new Quaternion()
  /** The rotation of each propeller about its shaft, in the order of PROPELLERS. */
  readonly propellerAngles = PROPELLERS.map(() => 0)
  /** Each motor's output from 0 to 1, in the order of PROPELLERS, as of the latest physics step. */
  readonly motors = PROPELLERS.map(() => 0)

  private readonly source: FlightInputSource
  private readonly area: FlightArea
  private drone: DroneState = createDroneState()
  private mode: FlightMode = 'DISARMED'
  private controls: FlightControls = NO_CONTROLS
  private cameraMode: CameraMode = 'follow'
  private message: string | null = null

  private readonly motorTargets = PROPELLERS.map(() => 0)
  private readonly previousPosition = new Vector3()
  private readonly previousQuaternion = new Quaternion()
  private accumulatorSeconds = 0
  private sinceSnapshotSeconds = 0
  private isIdle = true

  private snapshot: FlightSnapshot
  private readonly snapshotListeners = new Set<() => void>()
  private readonly wakeListeners = new Set<() => void>()
  private unsubscribeFromSource: (() => void) | null = null

  constructor(source: FlightInputSource, area: FlightArea) {
    this.source = source
    this.area = area
    this.syncRenderState()
    this.snapshot = this.createSnapshot()
  }

  start() {
    if (this.unsubscribeFromSource) return
    this.unsubscribeFromSource = this.source.subscribe(this.handleInputEvent)
    this.source.start()
  }

  /** Stops listening for input and returns everything to its starting state. */
  stop() {
    if (!this.unsubscribeFromSource) return
    this.unsubscribeFromSource()
    this.unsubscribeFromSource = null
    this.source.stop()
    this.reset()
  }

  command(command: FlightCommand) {
    switch (command) {
      case 'arm':
        this.arm()
        break
      case 'disarm':
        this.disarm()
        break
      case 'reset':
        this.reset()
        break
      case 'toggle-camera':
        this.cameraMode = this.cameraMode === 'follow' ? 'free' : 'follow'
        break
    }
    this.publish()
    this.wake()
  }

  /** Called once per rendered frame. */
  advance(frameSeconds: number) {
    const maxSeconds = this.isIdle ? FIRST_FRAME_SECONDS : FLIGHT_PHYSICS.maxFrameSeconds
    const stepSeconds = FLIGHT_PHYSICS.fixedStepSeconds
    const modeBefore = this.mode

    this.accumulatorSeconds += Math.min(frameSeconds, maxSeconds)
    while (this.accumulatorSeconds >= stepSeconds) {
      this.step(stepSeconds)
      this.accumulatorSeconds -= stepSeconds
    }

    const blend = this.accumulatorSeconds / stepSeconds
    this.renderPosition.lerpVectors(this.previousPosition, this.drone.position, blend)
    this.renderQuaternion.slerpQuaternions(this.previousQuaternion, this.drone.quaternion, blend)

    this.isIdle = !this.needsFrames()
    if (
      this.isIdle ||
      this.mode !== modeBefore ||
      this.sinceSnapshotSeconds >= SNAPSHOT_INTERVAL_SECONDS
    ) {
      this.publish()
    }
  }

  /** False once nothing would change until the next input, which lets the scene stop rendering. */
  needsFrames() {
    const { velocity, attitude, isGrounded } = this.drone
    return (
      this.mode !== 'DISARMED' ||
      !isGrounded ||
      this.source.isActive() ||
      velocity.lengthSq() > SETTLED_SPEED * SETTLED_SPEED ||
      Math.abs(attitude.roll) > SETTLED_DEGREES ||
      Math.abs(attitude.pitch) > SETTLED_DEGREES ||
      this.motors.some((output) => output > SETTLED_MOTOR)
    )
  }

  /** Changing device in flight would hand the drone to whatever the new one happens to be set at. */
  canChangeInput() {
    return this.mode === 'DISARMED' && this.drone.isGrounded
  }

  getCameraMode = () => this.cameraMode

  /** The drone's heading in degrees, for placing the follow camera. */
  getYawDegrees = () => this.drone.attitude.yaw

  getSnapshot = () => this.snapshot

  subscribe = (listener: () => void) => {
    this.snapshotListeners.add(listener)
    return () => {
      this.snapshotListeners.delete(listener)
    }
  }

  /** The listener is called when the scene needs to start rendering again. */
  subscribeToWake = (listener: () => void) => {
    this.wakeListeners.add(listener)
    return () => {
      this.wakeListeners.delete(listener)
    }
  }

  private step(deltaSeconds: number) {
    this.previousPosition.copy(this.drone.position)
    this.previousQuaternion.copy(this.drone.quaternion)

    this.controls = this.source.read(deltaSeconds)
    const setpoint = computeSetpoint(this.controls, this.mode, this.drone)
    stepPhysics(this.drone, setpoint, this.area, deltaSeconds)
    this.mode = nextFlightMode(this.mode, this.controls, this.drone)

    computeMotorTargets(this.controls, setpoint, this.mode, this.drone, this.motorTargets)
    const spool = 1 - Math.exp(-deltaSeconds / FLIGHT_CONTROL.motorTimeConstantSeconds)
    PROPELLERS.forEach(({ direction }, index) => {
      const output = this.motors[index] + (this.motorTargets[index] - this.motors[index]) * spool
      this.motors[index] = output > SETTLED_MOTOR || this.motorTargets[index] > 0 ? output : 0
      this.propellerAngles[index] +=
        direction * this.motors[index] * PROPELLER_MAX_RADIANS_PER_SECOND * deltaSeconds
    })

    this.sinceSnapshotSeconds += deltaSeconds
  }

  private arm() {
    if (this.mode !== 'DISARMED') return
    // Read afresh, because an idle scene hasn't been stepping the input.
    const fault = this.source.getFault()
    const block = fault ? `Cannot arm: ${fault}.` : armingBlock(this.source.read(0), this.drone)
    this.message = block
    if (!block) this.mode = 'ARMED'
  }

  /**
   * The failsafe: a device that can't be trusted loses control at once. The drone
   * stays disarmed when the device recovers, until someone arms it again.
   */
  private checkForFault() {
    const fault = this.source.getFault()

    if (fault && this.mode !== 'DISARMED') {
      this.mode = 'DISARMED'
      this.source.resetThrottle()
      this.controls = NO_CONTROLS
      this.message = `Failsafe: ${fault}. Motors off. Arm again when the signal is back.`
    }

    if (fault !== this.snapshot.inputFault) {
      if (!fault) this.controls = this.source.read(0)
      this.publish()
    }
  }

  /** Also the emergency stop: thrust ends at once, and in the air the drone falls. */
  private disarm() {
    if (this.mode === 'DISARMED') return
    this.message = this.drone.isGrounded ? null : 'Emergency stop: motors off.'
    this.mode = 'DISARMED'
    this.source.resetThrottle()
    this.controls = { ...this.controls, throttle: 0 }
  }

  private reset() {
    this.drone = createDroneState()
    this.mode = 'DISARMED'
    this.message = null
    this.controls = NO_CONTROLS
    this.source.resetThrottle()
    this.motors.fill(0)
    this.propellerAngles.fill(0)
    this.accumulatorSeconds = 0
    this.syncRenderState()
  }

  private syncRenderState() {
    this.previousPosition.copy(this.drone.position)
    this.previousQuaternion.copy(this.drone.quaternion)
    this.renderPosition.copy(this.drone.position)
    this.renderQuaternion.copy(this.drone.quaternion)
  }

  private createSnapshot(): FlightSnapshot {
    const { position, velocity, isAtBoundary } = this.drone
    return {
      mode: this.mode,
      controls: this.controls,
      altitude: position.y - DRONE_GROUND_Y,
      horizontalSpeed: Math.hypot(velocity.x, velocity.z),
      verticalSpeed: velocity.y,
      position: { x: position.x, y: position.y, z: position.z },
      attitude: { ...this.drone.attitude },
      motorOutputs: [...this.motors],
      isAtBoundary,
      cameraMode: this.cameraMode,
      message: this.message,
      inputFault: this.source.getFault(),
    }
  }

  private publish() {
    this.sinceSnapshotSeconds = 0
    this.snapshot = this.createSnapshot()
    this.snapshotListeners.forEach((listener) => listener())
  }

  private wake() {
    this.wakeListeners.forEach((listener) => listener())
  }

  private handleInputEvent = (event: FlightInputEvent) => {
    if (event.type === 'command') {
      this.command(event.command)
    } else {
      this.checkForFault()
      this.wake()
    }
  }
}
