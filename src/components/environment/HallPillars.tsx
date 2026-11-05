import { HALL } from '../../config/hall'
import { HALL_MATERIALS } from './hallMaterials'
import { InstancedBoxes, type Box } from './InstancedBoxes'

const { pillarLine, pillarWidth, height } = HALL

/** All outside the flight area, and clear of the wall displays. */
const PILLARS: [number, number][] = [
  ...[-21, -8.5, 8.5, 21].flatMap((x): [number, number][] => [
    [x, -pillarLine],
    [x, pillarLine],
  ]),
  ...[-20, 0, 20].flatMap((z): [number, number][] => [
    [-pillarLine, z],
    [pillarLine, z],
  ]),
]

const STRUCTURE = PILLARS.flatMap(([x, z]): Box[] => [
  { position: [x, height / 2, z], size: [pillarWidth, height, pillarWidth] },
  { position: [x, 0.3, z], size: [pillarWidth + 0.5, 0.6, pillarWidth + 0.5] },
])

const LIGHT_BANDS = PILLARS.map(([x, z]): Box => ({
  position: [x, 3, z],
  size: [pillarWidth + 0.04, 0.06, pillarWidth + 0.04],
}))

export function HallPillars() {
  return (
    <group name="HallPillars">
      <InstancedBoxes boxes={STRUCTURE} material={HALL_MATERIALS.structure} />
      <InstancedBoxes boxes={LIGHT_BANDS} material={HALL_MATERIALS.accent} />
    </group>
  )
}
