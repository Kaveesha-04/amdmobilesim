import { Environment, Lightformer } from '@react-three/drei'
import { useState } from 'react'
import { Object3D, type Vector3Tuple } from 'three'
import { SUN_OFFSET } from '../../config/world'

/** Half the width of the shadow map's coverage. Tight, so that the drone's shadow stays sharp. */
const SHADOW_RANGE = 3

interface LightingProps {
  /** The sun's shadows are centred here, so pass the drone's position. */
  focus: Vector3Tuple
}

export function Lighting({ focus }: LightingProps) {
  const [sunTarget] = useState(() => new Object3D())
  const sunPosition = focus.map((value, axis) => value + SUN_OFFSET[axis]) as Vector3Tuple

  return (
    <>
      <ambientLight intensity={0.7} />
      <primitive object={sunTarget} position={focus} />
      <directionalLight
        castShadow
        target={sunTarget}
        intensity={3}
        position={sunPosition}
        shadow-bias={-0.0002}
        shadow-normalBias={0.006}
        shadow-mapSize={[2048, 2048]}
        shadow-radius={3}
        shadow-camera-left={-SHADOW_RANGE}
        shadow-camera-right={SHADOW_RANGE}
        shadow-camera-top={SHADOW_RANGE}
        shadow-camera-bottom={-SHADOW_RANGE}
        shadow-camera-far={50}
      />
      {/* Metal and acrylic only look right with something to reflect. Built
          locally so that the scene doesn't download a lighting file at runtime. */}
      <Environment resolution={256}>
        <color attach="background" args={['#40566d']} />
        <Lightformer intensity={1.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
        <Lightformer intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer intensity={2} position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer color="#5d7a4c" intensity={1} position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[20, 20, 1]} />
      </Environment>
    </>
  )
}
