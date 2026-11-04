import { useEffect, useMemo, useState } from 'react'
import type { Vector3Tuple } from 'three'
import { Notice } from '../../components/common/Notice'
import { DroneScene } from '../../components/simulator/DroneScene'
import { MoonLadyDrone } from '../../components/simulator/MoonLadyDrone'
import { OrientationPivot, type AttitudeSource } from '../../components/simulator/OrientationPivot'
import { INSPECTION_CAMERA } from '../../config/camera'
import { TELEMETRY_CONFIG } from '../../config/telemetry'
import { createTelemetrySource } from '../../services/telemetry/telemetrySource'
import { TelemetryStore } from '../../stores/telemetryStore'
import { MockTelemetryControls } from './MockTelemetryControls'
import { TelemetryPanel } from './TelemetryPanel'
import { TelemetrySceneBadge } from './TelemetrySceneBadge'
import { naturalModeMetadata } from './metadata'

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

  return (
    <div className="space-y-4">
      <Notice title={naturalModeMetadata.title}>
        The drone stays at a fixed position, and only its orientation follows telemetry.
      </Notice>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* The position is on this outer group, so that the pivot inside has only rotation to change. */}
        <DroneScene
          className="h-[55vh] min-h-80"
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
        <div className="space-y-4">
          <TelemetryPanel
            store={store}
            sourceName={provider?.name ?? null}
            isSimulated={provider?.isSimulated ?? false}
          />
          {import.meta.env.DEV && mock && <MockTelemetryControls mock={mock} store={store} />}
        </div>
      </div>
    </div>
  )
}
