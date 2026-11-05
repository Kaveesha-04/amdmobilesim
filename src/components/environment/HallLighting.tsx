import { Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Object3D, type DirectionalLight, type Vector3, type Vector3Tuple } from 'three'
import { HALL_COLORS, KEY_LIGHT_OFFSET } from '../../config/hall'

/** Half the width of the shadow map's coverage. Tight, so that the drone's shadow stays sharp. */
const SHADOW_RANGE = 3

interface HallLightingProps {
  /** The key light's shadows are centred here, so pass the drone's position. */
  focus: Vector3Tuple
  /** Overrides `focus` every frame, so that the shadows stay on a drone that moves. */
  movingFocus?: Vector3
}

/**
 * Four lights in all, and only the key light casts a shadow. The ceiling fixtures,
 * screens and light strips glow by themselves, and add no lights.
 */
export function HallLighting({ focus, movingFocus }: HallLightingProps) {
  const [keyTarget] = useState(() => new Object3D())
  const key = useRef<DirectionalLight>(null)
  const keyPosition = focus.map((value, axis) => value + KEY_LIGHT_OFFSET[axis]) as Vector3Tuple

  useFrame(() => {
    if (!movingFocus || !key.current) return
    keyTarget.position.copy(movingFocus)
    key.current.position.set(...KEY_LIGHT_OFFSET).add(movingFocus)
  })

  return (
    <>
      <hemisphereLight args={['#C5D3E8', '#232D40', 1.3]} />
      <primitive object={keyTarget} position={focus} />
      <directionalLight
        ref={key}
        castShadow
        target={keyTarget}
        color={HALL_COLORS.displayLight}
        intensity={1.4}
        position={keyPosition}
        shadow-bias={-0.0002}
        shadow-normalBias={0.006}
        shadow-mapSize={[1024, 1024]}
        shadow-radius={3}
        shadow-camera-left={-SHADOW_RANGE}
        shadow-camera-right={SHADOW_RANGE}
        shadow-camera-top={SHADOW_RANGE}
        shadow-camera-bottom={-SHADOW_RANGE}
        shadow-camera-far={50}
      />

      {/* The display stand's lights. The spot aims at the hall's centre, its default. */}
      <spotLight
        color={HALL_COLORS.displayLight}
        position={[0, 14, 3]}
        angle={0.3}
        penumbra={0.7}
        intensity={420}
        decay={2}
      />
      <pointLight color={HALL_COLORS.accent} position={[0, 1.2, 0]} intensity={0.6} distance={5} decay={2} />

      {/* Metal and acrylic only look right with something to reflect. Built
          locally so that the scene doesn't download a lighting file at runtime. */}
      <Environment resolution={256}>
        <color attach="background" args={['#111A2A']} />
        <Lightformer intensity={2} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer intensity={2.5} position={[-6, 1.5, 2]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer intensity={1.8} position={[6, 1.5, -2]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer color={HALL_COLORS.accent} intensity={0.12} position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
      </Environment>
    </>
  )
}
