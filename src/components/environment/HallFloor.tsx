import { MeshStandardMaterial } from 'three'
import { GROUND_HEIGHT } from '../../config/world'
import { HALL } from '../../config/hall'
import { createGlowMaterial } from './hallMaterials'
import { getFloorSheenTexture, getFloorTexture } from './hallTextures'

let floorMaterial: MeshStandardMaterial | undefined
let sheenMaterial: ReturnType<typeof createGlowMaterial> | undefined

/** The surface sits at GROUND_HEIGHT, the height the physics lands the drone on. */
export function HallFloor() {
  floorMaterial ??= new MeshStandardMaterial({
    map: getFloorTexture(),
    metalness: 0.55,
    roughness: 0.45,
    envMapIntensity: 0.9,
  })
  sheenMaterial ??= createGlowMaterial(getFloorSheenTexture())

  return (
    <group name="HallFloor" position={[0, GROUND_HEIGHT, 0]} rotation-x={-Math.PI / 2}>
      <mesh receiveShadow material={floorMaterial}>
        <planeGeometry args={[HALL.size, HALL.size]} />
      </mesh>
      <mesh position={[0, 0, 0.003]} material={sheenMaterial}>
        <planeGeometry args={[HALL.size, HALL.size]} />
      </mesh>
    </group>
  )
}
