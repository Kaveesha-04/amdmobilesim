import { Notice } from '../../components/common/Notice'
import { DroneScene } from '../../components/simulator/DroneScene'
import { artificialModeMetadata } from './metadata'

export default function ArtificialModeView() {
  return (
    <div className="space-y-4">
      <Notice title={artificialModeMetadata.title}>
        The drone is at rest. Transmitter input and simulated flight will be added in a later
        phase.
      </Notice>
      <DroneScene className="h-[55vh] min-h-80" />
    </div>
  )
}
