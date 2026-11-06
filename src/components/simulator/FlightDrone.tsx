import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { Group, Object3D } from 'three'
import { PROPELLERS } from '../../config/flight'
import type { FlightStore } from '../../stores/flightStore'
import { MoonLadyDrone } from './MoonLadyDrone'
import { MotorIndicators } from './MotorIndicators'

/**
 * Draws the virtual drone where the simulation says it is. It only copies values,
 * so the physics stays the one thing that decides the drone's position and rotation.
 *
 * The simulation advances here, once per rendered frame. Frames are requested only
 * while something is changing, which keeps the on-demand renderer idle otherwise.
 */
export function FlightDrone({ store }: { store: FlightStore }) {
  const body = useRef<Group>(null)
  const propellers = useRef<(Object3D | undefined)[]>([])
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => store.subscribeToWake(() => invalidate()), [store, invalidate])

  useEffect(() => {
    const found = PROPELLERS.map(({ name }) => body.current?.getObjectByName(name))
    const missing = PROPELLERS.filter((_, index) => !found[index]).map(({ name }) => name)
    if (missing.length > 0) {
      console.error(`Not animating propellers missing from the model: ${missing.join(', ')}`)
    }
    propellers.current = found

    return () => {
      // The loaded model is cached and shared, so leave it as it was found.
      found.forEach((propeller) => propeller?.rotation.set(0, 0, 0))
    }
  }, [])

  useFrame((_, delta) => {
    store.advance(delta)

    body.current?.position.copy(store.renderPosition)
    body.current?.quaternion.copy(store.renderQuaternion)
    propellers.current.forEach((propeller, index) => {
      // Each blade lies flat in its node's XZ plane, so local Y is the motor shaft.
      if (propeller) propeller.rotation.y = store.propellerAngles[index]
    })

    if (store.needsFrames()) invalidate()
  })

  return (
    <group ref={body} name="FlightDrone">
      <MoonLadyDrone />
      <MotorIndicators store={store} />
    </group>
  )
}
