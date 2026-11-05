import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useState } from 'react'
import { Vector3 } from 'three'
import { CAMERA_ZOOM } from '../../config/camera'
import type { CameraZoom } from '../../stores/cameraZoom'

/** A longer gap than this between frames still only moves the camera this far, so it can't jump. */
const MAX_FRAME_SECONDS = 0.05
/** Runs just before OrbitControls updates, which then applies its limits to where this put the camera. */
const BEFORE_ORBIT_UPDATE = -2

/** The parts of the scene's OrbitControls used by the cameras. */
export interface OrbitControlsLike {
  enabled: boolean
  target: Vector3
}

/**
 * Moves the camera along its line to the orbit centre while the zoom is changing, and
 * reports what the orbit controls do to the distance otherwise. It moves the existing
 * camera, which is the input OrbitControls expects, so the two never disagree.
 */
export function CameraZoomRig({ zoom }: { zoom: CameraZoom }) {
  const invalidate = useThree((state) => state.invalidate)
  const canvas = useThree((state) => state.gl.domElement)
  const controls = useThree((state) => state.controls) as unknown as OrbitControlsLike | null
  const [offset] = useState(() => new Vector3())

  useLayoutEffect(() => {
    zoom.moveNewCamera()
  }, [zoom])

  useEffect(() => zoom.subscribe(() => invalidate()), [zoom, invalidate])

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (controls?.enabled) {
        zoom.handOverToOrbit()
      } else {
        // The orbit controls are off under the follow camera, so they won't see this.
        zoom.zoomBy(CAMERA_ZOOM.wheelFactorPerNotch ** (event.deltaY / 100))
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: true })
    return () => canvas.removeEventListener('wheel', handleWheel)
  }, [canvas, controls, zoom])

  useFrame(({ camera }, delta) => {
    if (!controls?.enabled) return

    offset.subVectors(camera.position, controls.target)
    const distance = offset.length()
    const next = zoom.stepTowards(distance, Math.min(delta, MAX_FRAME_SECONDS))

    if (next === null) {
      zoom.syncWithCamera(distance)
      return
    }

    camera.position.copy(controls.target).addScaledVector(offset, next / distance)
    invalidate()
  }, BEFORE_ORBIT_UPDATE)

  return null
}
