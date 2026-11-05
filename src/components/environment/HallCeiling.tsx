import { BEAM_LINES, FIXTURE_LINES, HALL } from '../../config/hall'
import { HALL_MATERIALS } from './hallMaterials'
import { InstancedBoxes, type Box } from './InstancedBoxes'

const BEAM_DEPTH = 0.8
const BEAM_Y = HALL.beamBottom + BEAM_DEPTH / 2
const CROSS_BEAM_DEPTH = 0.4
const CROSS_BEAM_Y = HALL.beamBottom + BEAM_DEPTH - CROSS_BEAM_DEPTH / 2
const FIXTURE_Y = HALL.beamBottom + 0.9

const BEAMS: Box[] = [
  ...BEAM_LINES.map((z): Box => ({
    position: [0, BEAM_Y, z],
    size: [HALL.size, BEAM_DEPTH, 0.5],
  })),
  ...BEAM_LINES.map((x): Box => ({
    position: [x, CROSS_BEAM_Y, 0],
    size: [0.3, CROSS_BEAM_DEPTH, HALL.size],
  })),
]

const FIXTURES: Box[] = FIXTURE_LINES.flatMap((x) =>
  FIXTURE_LINES.map((z): Box => ({
    position: [x, FIXTURE_Y, z],
    size: [5, 0.08, 0.5],
  })),
)

export function HallCeiling() {
  return (
    <group name="HallCeiling">
      <mesh position={[0, HALL.height, 0]} rotation-x={Math.PI / 2} material={HALL_MATERIALS.ceiling}>
        <planeGeometry args={[HALL.size, HALL.size]} />
      </mesh>
      <InstancedBoxes boxes={BEAMS} material={HALL_MATERIALS.structure} />
      <InstancedBoxes boxes={FIXTURES} material={HALL_MATERIALS.fixture} />
    </group>
  )
}
