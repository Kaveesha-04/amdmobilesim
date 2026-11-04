import type { Vector3Tuple } from 'three'
import { Notice } from '../../components/common/Notice'
import { DroneScene } from '../../components/simulator/DroneScene'
import { FLIGHT_CAMERA } from '../../config/camera'
import { DEFAULT_FLIGHT_AREA } from '../../config/world'
import { artificialModeMetadata } from './metadata'

const START_POSITION: Vector3Tuple = [0, 1, 0]

export default function ArtificialModeView() {
  const { width, depth, height } = DEFAULT_FLIGHT_AREA

  return (
    <div className="space-y-4">
      <Notice title={artificialModeMetadata.title}>
        The drone is at its start position in a {width} × {depth} × {height} m flight area.
        Transmitter input and simulated flight will be added in a later phase.
      </Notice>
      <DroneScene
        className="h-[55vh] min-h-80"
        dronePosition={START_POSITION}
        camera={FLIGHT_CAMERA}
        flightArea={DEFAULT_FLIGHT_AREA}
      />
    </div>
  )
}
