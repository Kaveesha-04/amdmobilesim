import { useLayoutEffect, useRef } from 'react'
import { BoxGeometry, Object3D, type InstancedMesh, type Material, type Vector3Tuple } from 'three'

export interface Box {
  position: Vector3Tuple
  size: Vector3Tuple
}

const UNIT_BOX = new BoxGeometry(1, 1, 1)
const placer = new Object3D()

/** Draws many boxes with the same material as a single draw call. Keep `boxes` constant. */
export function InstancedBoxes({ boxes, material }: { boxes: Box[]; material: Material }) {
  const mesh = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const instances = mesh.current
    if (!instances) return

    boxes.forEach(({ position, size }, index) => {
      placer.position.set(...position)
      placer.scale.set(...size)
      placer.updateMatrix()
      instances.setMatrixAt(index, placer.matrix)
    })
    instances.instanceMatrix.needsUpdate = true
    instances.computeBoundingSphere()
  }, [boxes])

  return <instancedMesh ref={mesh} args={[UNIT_BOX, material, boxes.length]} />
}
