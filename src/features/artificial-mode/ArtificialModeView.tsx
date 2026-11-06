import { DroneScene } from '../../components/simulator/DroneScene'
import { FlightDrone } from '../../components/simulator/FlightDrone'
import { FollowCamera } from '../../components/simulator/FollowCamera'
import { FLIGHT_CAMERA } from '../../config/camera'
import { DRONE_START_POSITION } from '../../config/flight'
import { DEFAULT_FLIGHT_AREA } from '../../config/world'
import type { PilotInputSource } from '../../services/flightInput/PilotInputSource'
import { getCameraZoom } from '../../stores/cameraZoom'
import type { FlightStore } from '../../stores/flightStore'
import { TouchControls } from './TouchControls'

export function ArtificialModeView({ store, pilot }: { store: FlightStore; pilot: PilotInputSource }) {
  return (
    <DroneScene
      className="h-full w-full"
      dronePosition={DRONE_START_POSITION}
      camera={FLIGHT_CAMERA}
      flightArea={DEFAULT_FLIGHT_AREA}
      movingFocus={store.renderPosition}
      overlay={<TouchControls store={store} pilot={pilot} />}
    >
      <FlightDrone store={store} />
      <FollowCamera store={store} zoom={getCameraZoom(FLIGHT_CAMERA)} />
    </DroneScene>
  )
}
