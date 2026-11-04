import { useGLTF } from '@react-three/drei'
import { useThree, type ThreeElements } from '@react-three/fiber'
import { useEffect } from 'react'
import { Mesh, MeshPhysicalMaterial } from 'three'
import { logDroneHierarchy } from '../../utils/droneHierarchy'

const MODEL_URL = `${import.meta.env.BASE_URL}models/MoonLady_Beta_1.glb`

/**
 * The drone at its true size in metres. Position and rotate it through the
 * props or ref of this group, so the model's own transforms stay untouched.
 *
 * Forward is -Z, right is +X and up is +Y, so pitch turns about X, yaw about Y
 * and roll about Z. The scene renders on demand, so call `invalidate()` after
 * changing the group through its ref.
 */
export function MoonLadyDrone(props: ThreeElements['group']) {
  const { scene } = useGLTF(MODEL_URL)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        // A clear part like the acrylic plate would otherwise cast a solid shadow.
        const isClear =
          object.material instanceof MeshPhysicalMaterial && object.material.transmission > 0
        object.castShadow = !isClear
        object.receiveShadow = true
      }
    })

    invalidate()

    if (import.meta.env.DEV) {
      logDroneHierarchy(scene)
    }
  }, [scene, invalidate])

  return (
    // YXZ applies yaw, then pitch, then roll, which is how flight attitude is defined.
    <group rotation-order="YXZ" {...props}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
