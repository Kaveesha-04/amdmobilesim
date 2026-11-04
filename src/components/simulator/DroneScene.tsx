import { Canvas } from '@react-three/fiber'
import { Suspense, useState, type ReactNode } from 'react'
import type { Vector3Tuple } from 'three'
import type { CameraPreset } from '../../config/camera'
import type { FlightArea } from '../../config/world'
import { isWebGLAvailable } from '../../utils/webgl'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { Notice } from '../common/Notice'
import { OutdoorEnvironment } from '../environment/OutdoorEnvironment'
import { ModelLoadingIndicator } from './ModelLoadingIndicator'
import { MoonLadyDrone } from './MoonLadyDrone'
import { SceneCamera } from './SceneCamera'

interface DroneSceneProps {
  /** Sizes the scene. The canvas fills this box, so it needs a height. */
  className?: string
  dronePosition: Vector3Tuple
  camera: CameraPreset
  /** Shows this area's boundary. Leave it out for no boundary. */
  flightArea?: FlightArea
  /** What to show as the drone. Defaults to the MoonLady Beta 1 model at dronePosition. */
  children?: ReactNode
  /** Interface shown over the scene. Kept outside the canvas, so that its updates don't re-render the scene. */
  overlay?: ReactNode
}

export function DroneScene({
  className = '',
  dronePosition,
  camera,
  flightArea,
  children = <MoonLadyDrone position={dronePosition} />,
  overlay,
}: DroneSceneProps) {
  const [canRender] = useState(isWebGLAvailable)

  if (!canRender) {
    return (
      <Notice title="3D view unavailable" tone="error">
        This browser or device doesn't support WebGL 2, which the 3D scene needs.
      </Notice>
    )
  }

  return (
    <ErrorBoundary
      fallback={
        <Notice title="Drone model could not be loaded" tone="error">
          Check that public/models/MoonLady_Beta_1.glb exists, then reload the page.
        </Notice>
      }
    >
      <div className={`relative overflow-hidden rounded-lg border border-slate-800 ${className}`}>
        {/* Renders only when something changes, because the glass pass is costly to redraw. */}
        <Canvas frameloop="demand" shadows="percentage">
          <SceneCamera preset={camera} dronePosition={dronePosition} />
          <OutdoorEnvironment focus={dronePosition} flightArea={flightArea} />
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
        <ModelLoadingIndicator />
        {overlay}
      </div>
    </ErrorBoundary>
  )
}
