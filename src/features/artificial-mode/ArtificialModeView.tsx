import { useEffect, useMemo, useState } from 'react'
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
import { useRegisterModeRuntime } from '../../hooks/useModeRuntime'
import type { ArtificialRuntime } from '../../stores/ModeRuntimeContext'
import { FlightReadout } from './FlightReadout'
import { FlightSceneBadge } from './FlightSceneBadge'

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

  const runtime = useMemo<ArtificialRuntime>(
    () => ({
      mode: 'artificial',
      store,
      inputs,
      configuredReceiverUrl: TRANSMITTER_CONFIG.receiverUrl,
      calibrationError,
      staleAfterMs: TRANSMITTER_CONFIG.staleAfterMs,
    }),
    [store, inputs],
  )
  useRegisterModeRuntime(runtime)

  // Input, polling and simulation run only while this mode is on screen.
  useEffect(() => {
    store.start()
    return () => store.stop()
  }, [store])

  return (
    <DroneScene
      className="h-full w-full"
      dronePosition={DRONE_START_POSITION}
      camera={FLIGHT_CAMERA}
      flightArea={DEFAULT_FLIGHT_AREA}
      movingFocus={store.renderPosition}
      overlay={
        <>
          <FlightSceneBadge store={store} />
          <FlightReadout store={store} />
        </>
      }
    >
      <FlightDrone store={store} />
      <FollowCamera store={store} />
    </DroneScene>
  )
}
