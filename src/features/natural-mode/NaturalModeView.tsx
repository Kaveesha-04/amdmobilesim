import type { Vector3Tuple } from 'three'
import { Notice } from '../../components/common/Notice'
import { DroneScene } from '../../components/simulator/DroneScene'
import { INSPECTION_CAMERA } from '../../config/camera'
import { naturalModeMetadata } from './metadata'

/** High enough that the propellers clear the ground at any orientation. */
const DRONE_POSITION: Vector3Tuple = [0, 0.35, 0]

export default function NaturalModeView() {
  return (
    <div className="space-y-4">
      <Notice title={naturalModeMetadata.title}>
        The drone stays at a fixed position. Live orientation from the actual drone will be added
        in a later phase.
      </Notice>
      <DroneScene className="h-[55vh] min-h-80" dronePosition={DRONE_POSITION} camera={INSPECTION_CAMERA} />
    </div>
  )
}
