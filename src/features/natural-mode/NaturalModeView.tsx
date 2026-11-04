import { Notice } from '../../components/common/Notice'
import { DroneScene } from '../../components/simulator/DroneScene'
import { naturalModeMetadata } from './metadata'

export default function NaturalModeView() {
  return (
    <div className="space-y-4">
      <Notice title={naturalModeMetadata.title}>
        The drone stays at a fixed position. Live orientation from the actual drone will be added
        in a later phase.
      </Notice>
      <DroneScene className="h-[55vh] min-h-80" />
    </div>
  )
}
