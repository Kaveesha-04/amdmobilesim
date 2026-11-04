import { useEffect, useState, useSyncExternalStore } from 'react'
import { Notice } from '../../components/common/Notice'
import { DroneScene } from '../../components/simulator/DroneScene'
import { FlightDrone } from '../../components/simulator/FlightDrone'
import { FollowCamera } from '../../components/simulator/FollowCamera'
import { FLIGHT_CAMERA } from '../../config/camera'
import { DRONE_START_POSITION, FLIGHT_KEY_MAP } from '../../config/flight'
import { TRANSMITTER_CALIBRATION_JSON, TRANSMITTER_CONFIG } from '../../config/transmitter'
import { DEFAULT_FLIGHT_AREA } from '../../config/world'
import { InputController } from '../../services/flightInput/InputController'
import { KeyboardInputSource } from '../../services/flightInput/KeyboardInputSource'
import { TransmitterInputSource } from '../../services/flightInput/TransmitterInputSource'
import { parseCalibration } from '../../services/transmitter/calibration'
import { loadSavedReceiverUrl } from '../../services/transmitter/receiverUrl'
import { TransmitterService } from '../../services/transmitter/transmitterService'
import { FlightStore } from '../../stores/flightStore'
import { FlightHud } from './FlightHud'
import { FlightSceneBadge } from './FlightSceneBadge'
import { TransmitterPanel } from './TransmitterPanel'
import { artificialModeMetadata } from './metadata'

const { calibration, error: calibrationError } = parseCalibration(TRANSMITTER_CALIBRATION_JSON)

export default function ArtificialModeView() {
  const [inputs] = useState(
    () =>
      new InputController(
        new KeyboardInputSource(FLIGHT_KEY_MAP),
        new TransmitterInputSource(
          new TransmitterService({
            ...TRANSMITTER_CONFIG,
            receiverUrl: loadSavedReceiverUrl() ?? TRANSMITTER_CONFIG.receiverUrl,
          }),
          calibration,
          calibrationError,
        ),
      ),
  )
  const [store] = useState(() => new FlightStore(inputs, DEFAULT_FLIGHT_AREA))
  const inputKind = useSyncExternalStore(inputs.subscribeToKind, inputs.getKind)
  const { width, depth, height } = DEFAULT_FLIGHT_AREA

  // Input, polling and simulation run only while this mode is on screen.
  useEffect(() => {
    store.start()
    return () => store.stop()
  }, [store])

  return (
    <div className="space-y-4">
      <Notice title={artificialModeMetadata.title}>
        Arm with Enter or the Arm button, then raise the throttle to take off. The drone hovers at
        half throttle and stays inside a {width} × {depth} × {height} m flight area.
      </Notice>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <DroneScene
          className="h-[55vh] min-h-80"
          dronePosition={DRONE_START_POSITION}
          camera={FLIGHT_CAMERA}
          flightArea={DEFAULT_FLIGHT_AREA}
          movingFocus={store.renderPosition}
          overlay={<FlightSceneBadge store={store} />}
        >
          <FlightDrone store={store} />
          <FollowCamera store={store} />
        </DroneScene>
        <div className="space-y-4">
          <FlightHud store={store} inputs={inputs} />
          {inputKind === 'transmitter' && (
            <TransmitterPanel
              source={inputs.transmitterSource}
              store={store}
              configuredUrl={TRANSMITTER_CONFIG.receiverUrl}
              calibrationError={calibrationError}
              staleAfterMs={TRANSMITTER_CONFIG.staleAfterMs}
            />
          )}
        </div>
      </div>
    </div>
  )
}
