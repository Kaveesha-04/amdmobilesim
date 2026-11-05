import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Quaternion, type Group } from 'three'
import type { Attitude } from '../../types/telemetry'
import { attitudeToQuaternion, stepOrientation } from '../../utils/orientation'

/** Stands in for the time since the last frame, which is meaningless after the scene has been idle. */
const FIRST_FRAME_SECONDS = 1 / 60

export interface AttitudeSource {
  /** The orientation to show, or null to stay as it is. */
  getAttitude: () => Attitude | null
  /** Returns the function that unsubscribes. */
  subscribe: (listener: () => void) => () => void
}

interface OrientationPivotProps {
  source: AttitudeSource
  /** See smoothingTimeConstantSeconds in config/telemetry.ts. */
  smoothingTimeConstantSeconds: number
  children: ReactNode
}

/**
 * Rotates its children about their own origin, and does nothing else: it never
 * sets a position. The model's own transforms stay untouched.
 *
 * It follows the source directly rather than through React state, so telemetry
 * doesn't re-render the scene. It also requests frames only while turning, which
 * keeps the on-demand renderer idle when the orientation isn't changing.
 */
export function OrientationPivot({
  source,
  smoothingTimeConstantSeconds,
  children,
}: OrientationPivotProps) {
  const pivot = useRef<Group>(null)
  const invalidate = useThree((state) => state.invalidate)
  const [target] = useState(() => new Quaternion())
  const isAtRest = useRef(true)

  useEffect(() => {
    const updateTarget = () => {
      const attitude = source.getAttitude()
      if (!attitude) return

      attitudeToQuaternion(attitude, target)
      if (!pivot.current?.quaternion.equals(target)) invalidate()
    }

    updateTarget()
    return source.subscribe(updateTarget)
  }, [source, target, invalidate])

  useFrame((_, delta) => {
    const orientation = pivot.current?.quaternion
    if (!orientation || orientation.equals(target)) return

    const deltaSeconds = isAtRest.current ? Math.min(delta, FIRST_FRAME_SECONDS) : delta
    isAtRest.current = stepOrientation(
      orientation,
      target,
      deltaSeconds,
      smoothingTimeConstantSeconds,
    )
    if (!isAtRest.current) invalidate()
  })

  return <group ref={pivot}>{children}</group>
}
