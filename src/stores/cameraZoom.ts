import { CAMERA_ZOOM, type CameraPreset } from '../config/camera'

const SETTLED_RATIO = 0.002
/** Smaller changes than this from the mouse wheel aren't worth redrawing the zoom control for. */
const REPORTED_RATIO = 0.001

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/**
 * How far the camera should be from the drone. The zoom control and the camera share
 * this, and it lives outside React so that zooming doesn't re-render the 3D scene.
 */
export class CameraZoom {
  readonly minDistance: number
  readonly maxDistance: number
  readonly defaultDistance: number

  private distance: number
  private isMoving = false
  private needsDroneFocus = false
  private readonly listeners = new Set<() => void>()

  constructor({ minDistance, maxDistance, defaultDistance }: CameraPreset) {
    this.minDistance = minDistance
    this.maxDistance = maxDistance
    this.defaultDistance = defaultDistance
    this.distance = defaultDistance
  }

  getDistance = () => this.distance

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  setDistance(distance: number) {
    this.distance = clamp(distance, this.minDistance, this.maxDistance)
    this.isMoving = true
    this.needsDroneFocus = true
    this.publish()
  }

  zoomBy(factor: number) {
    this.setDistance(this.distance * factor)
  }

  reset() {
    this.setDistance(this.defaultDistance)
  }

  /** A new camera starts at the preset's offset, so has to be brought to the saved distance. */
  moveNewCamera() {
    this.isMoving = true
  }

  /** The orbit controls are about to change the distance themselves, and should win. */
  handOverToOrbit() {
    this.isMoving = false
    this.needsDroneFocus = true
  }

  /** The distance a camera should have after this frame, or null if it isn't being moved. */
  stepTowards(current: number, seconds: number) {
    if (!this.isMoving) return null

    const blend = 1 - Math.exp(-seconds / CAMERA_ZOOM.timeConstantSeconds)
    // Blending the logarithms makes a change feel the same speed at any distance.
    const next = current * (this.distance / current) ** blend

    if (Math.abs(next / this.distance - 1) < SETTLED_RATIO) {
      this.isMoving = false
      return this.distance
    }
    return next
  }

  /** Follows a change that came from the orbit controls. */
  syncWithCamera(current: number) {
    if (Math.abs(current / this.distance - 1) < REPORTED_RATIO) return
    this.distance = clamp(current, this.minDistance, this.maxDistance)
    this.publish()
  }

  /** Whether zooming should bring the drone back to the centre of the orbit. */
  wantsDroneFocus() {
    return this.needsDroneFocus
  }

  markDroneFocused() {
    this.needsDroneFocus = false
  }

  private publish() {
    this.listeners.forEach((listener) => listener())
  }
}

const zoomForPreset = new Map<CameraPreset, CameraZoom>()

/** Each preset keeps its own zoom, so that a mode's zoom is still there on coming back to it. */
export function getCameraZoom(preset: CameraPreset) {
  let zoom = zoomForPreset.get(preset)
  if (!zoom) {
    zoom = new CameraZoom(preset)
    zoomForPreset.set(preset, zoom)
  }
  return zoom
}
