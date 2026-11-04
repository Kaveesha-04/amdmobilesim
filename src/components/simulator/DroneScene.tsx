import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useState, type ReactNode } from 'react'
import { isWebGLAvailable } from '../../utils/webgl'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { Notice } from '../common/Notice'
import { GroundPlane } from './GroundPlane'
import { ModelLoadingIndicator } from './ModelLoadingIndicator'
import { MoonLadyDrone } from './MoonLadyDrone'
import { SceneLighting } from './SceneLighting'

const BACKGROUND_COLOR = '#0b1220'

/** High enough that the propellers clear the ground when the drone rolls or pitches. */
const DRONE_HOME_POSITION: [number, number, number] = [0, 0.35, 0]

interface DroneSceneProps {
  /** Sizes the scene. The canvas fills this box, so it needs a height. */
  className?: string
  /** What to show as the drone. Defaults to the MoonLady Beta 1 model. */
  children?: ReactNode
}

export function DroneScene({
  className = '',
  children = <MoonLadyDrone position={DRONE_HOME_POSITION} />,
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
          <color attach="background" args={[BACKGROUND_COLOR]} />
          <fog attach="fog" args={[BACKGROUND_COLOR, 6, 16]} />
          <PerspectiveCamera makeDefault fov={50} near={0.01} position={[0.55, 0.65, 0.75]} />
          {/* Panning would move the orbit centre, which could take the camera below the ground. */}
          <OrbitControls
            makeDefault
            target={[0, 0.38, 0]}
            enablePan={false}
            dampingFactor={0.08}
            minDistance={0.3}
            maxDistance={4}
            maxPolarAngle={Math.PI / 2}
          />
          <SceneLighting />
          <GroundPlane />
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
        <ModelLoadingIndicator />
      </div>
    </ErrorBoundary>
  )
}
