import { useEffect, useState } from 'react'
import { Notice } from '../../components/common/Notice'
import { DroneScene } from '../../components/simulator/DroneScene'
import { FlightDrone } from '../../components/simulator/FlightDrone'
import { FollowCamera } from '../../components/simulator/FollowCamera'
import { FLIGHT_CAMERA } from '../../config/camera'
import { DRONE_START_POSITION, FLIGHT_KEY_MAP } from '../../config/flight'
import { DEFAULT_FLIGHT_AREA } from '../../config/world'
import { KeyboardInputSource } from '../../services/flightInput/KeyboardInputSource'
import { FlightStore } from '../../stores/flightStore'
import { FlightHud } from './FlightHud'
import { artificialModeMetadata } from './metadata'

export default function ArtificialModeView() {
  const [store] = useState(
    () => new FlightStore(new KeyboardInputSource(FLIGHT_KEY_MAP), DEFAULT_FLIGHT_AREA),
  )
  const { width, depth, height } = DEFAULT_FLIGHT_AREA

  // Input and simulation run only while this mode is on screen.
  useEffect(() => {
    store.start()
    return () => store.stop()
  }, [store])

  return (
    <div className="space-y-4">
      <Notice title={artificialModeMetadata.title}>
        Press Enter to arm, then hold ↑ to take off. The drone hovers at half throttle and stays
        inside a {width} × {depth} × {height} m flight area.
      </Notice>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <DroneScene
          className="h-[55vh] min-h-80"
          dronePosition={DRONE_START_POSITION}
          camera={FLIGHT_CAMERA}
          flightArea={DEFAULT_FLIGHT_AREA}
          movingFocus={store.renderPosition}
        >
          <FlightDrone store={store} />
          <FollowCamera store={store} />
        </DroneScene>
        <FlightHud store={store} />
      </div>
    </div>
  )
}
