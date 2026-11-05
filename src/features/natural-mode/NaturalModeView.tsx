import { useEffect, useMemo, useState } from 'react'
import type { Vector3Tuple } from 'three'
import { DroneScene } from '../../components/simulator/DroneScene'
import { MoonLadyDrone } from '../../components/simulator/MoonLadyDrone'
import { OrientationPivot, type AttitudeSource } from '../../components/simulator/OrientationPivot'
import { INSPECTION_CAMERA } from '../../config/camera'
import { TELEMETRY_CONFIG } from '../../config/telemetry'
import { createTelemetrySource } from '../../services/telemetry/telemetrySource'
import { TelemetryStore } from '../../stores/telemetryStore'
import { useRegisterModeRuntime } from '../../hooks/useModeRuntime'
import type { NaturalRuntime } from '../../stores/ModeRuntimeContext'
import { TelemetrySceneBadge } from './TelemetrySceneBadge'

/** High enough that the propellers clear the ground at any orientation. */
const DRONE_POSITION: Vector3Tuple = [0, 0.35, 0]

export default function NaturalModeView() {
  const [{ provider, mock }] = useState(createTelemetrySource)
  const [store] = useState(() => new TelemetryStore(provider))

  // Telemetry runs only while this mode is on screen.
  useEffect(() => {
    store.start()
    return () => store.stop()
  }, [store])

  const attitudeSource = useMemo<AttitudeSource>(
    () => ({ getAttitude: () => store.getState().sample, subscribe: store.subscribe }),
    [store],
  )

  const runtime = useMemo<NaturalRuntime>(
    () => ({
      mode: 'natural',
      store,
      sourceName: provider?.name ?? null,
      isSimulated: provider?.isSimulated ?? false,
      mock,
    }),
    [store, provider, mock],
  )
  useRegisterModeRuntime(runtime)

  return (
    // The position is on this outer group, so that the pivot inside has only rotation to change.
    <DroneScene
      className="h-full w-full"
      dronePosition={DRONE_POSITION}
      camera={INSPECTION_CAMERA}
      overlay={<TelemetrySceneBadge store={store} />}
    >
      <group position={DRONE_POSITION}>
        <OrientationPivot
          source={attitudeSource}
          smoothingTimeConstantSeconds={TELEMETRY_CONFIG.smoothingTimeConstantSeconds}
        >
          <MoonLadyDrone />
        </OrientationPivot>
      </group>
    </DroneScene>
  )
}
