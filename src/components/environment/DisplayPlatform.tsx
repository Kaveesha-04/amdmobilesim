import type { Material } from 'three'
import { GROUND_HEIGHT } from '../../config/world'
import { createGlowMaterial, HALL_MATERIALS } from './hallMaterials'
import { getBrandRingTexture } from './hallTextures'

const SEGMENTS = 96
/** Stops the flat version's layers drawing through each other. */
const LAYER_GAP = 0.004

/**
 * The centre stays at floor level. Natural Mode's drone can take any attitude at its
 * fixed position, which brings its propeller tips almost to the floor, and they sweep
 * a radius of 0.352 m. The steps start outside that, so nothing can touch them.
 */
const CENTRE_RADIUS = 0.45
const TIERS = [
  { inner: CENTRE_RADIUS, outer: 0.82, top: 0.09 },
  { inner: 0.82, outer: 1.08, top: 0.06 },
  { inner: 1.08, outer: 1.34, top: 0.03 },
]

let brandMaterial: ReturnType<typeof createGlowMaterial> | undefined

function FlatRing({ inner, outer, y, material }: { inner: number; outer: number; y: number; material: Material }) {
  return (
    <mesh receiveShadow position-y={y} rotation-x={-Math.PI / 2} material={material}>
      <ringGeometry args={[inner, outer, SEGMENTS]} />
    </mesh>
  )
}

function LightRing({ radius, y }: { radius: number; y: number }) {
  return (
    <mesh position-y={y} rotation-x={Math.PI / 2} material={HALL_MATERIALS.accent}>
      <torusGeometry args={[radius, 0.005, 6, SEGMENTS]} />
    </mesh>
  )
}

/**
 * The exhibition stand at the centre of the hall. It isn't connected to the drone.
 *
 * With `raised` off it's flat markings on the floor. Artificial Mode needs this: the
 * physics treats the whole floor as flat, so the drone would land and fly through steps.
 */
export function DisplayPlatform({ raised }: { raised: boolean }) {
  brandMaterial ??= createGlowMaterial(getBrandRingTexture())

  const tierHeight = (top: number, index: number) => (raised ? top : LAYER_GAP * (3 - index))
  const brandTier = TIERS[0]
  const brandY = tierHeight(brandTier.top, 0) + LAYER_GAP / 2

  return (
    <group name="DisplayPlatform" position-y={GROUND_HEIGHT}>
      <FlatRing inner={0} outer={CENTRE_RADIUS} y={LAYER_GAP} material={HALL_MATERIALS.platform} />
      <LightRing radius={0.38} y={LAYER_GAP + 0.002} />

      {TIERS.map(({ inner, outer, top }, index) => {
        const height = tierHeight(top, index)
        return (
          <group key={outer}>
            <FlatRing inner={inner} outer={outer} y={height} material={HALL_MATERIALS.platform} />
            {raised && (
              <mesh position-y={height / 2} material={HALL_MATERIALS.platformEdge}>
                <cylinderGeometry args={[outer, outer, height, SEGMENTS, 1, true]} />
              </mesh>
            )}
            <LightRing radius={outer - 0.008} y={height + 0.002} />
          </group>
        )
      })}

      {raised && (
        // The inside wall of the first step, facing the centre.
        <mesh position-y={TIERS[0].top / 2} material={HALL_MATERIALS.platformInnerEdge}>
          <cylinderGeometry args={[CENTRE_RADIUS, CENTRE_RADIUS, TIERS[0].top, SEGMENTS, 1, true]} />
        </mesh>
      )}

      {/* Mapped across a disc the size of the first step's outer edge, so the letters land on it. */}
      <FlatRing inner={brandTier.inner} outer={brandTier.outer} y={brandY} material={brandMaterial} />
    </group>
  )
}
