import { useMemo } from 'react'
import { GROUND_HEIGHT, type FlightArea as FlightAreaSize } from '../../config/world'
import { HALL_COLORS } from '../../config/hall'
import { FlightBoundary } from './FlightBoundary'
import { HALL_MATERIALS } from './hallMaterials'
import { InstancedBoxes, type Box } from './InstancedBoxes'

const LINE_THICKNESS = 0.008
/** Each kind of line sits just above the last, so that they don't flicker where they cross. */
const LINE_HEIGHTS = { grid: 0.006, edge: 0.008, corner: 0.01 }
const GRID_SPACING = 10
const GRID_WIDTH = 0.04
const EDGE_WIDTH = 0.12
const CORNER_LENGTH = 2.5
const CORNER_WIDTH = 0.2

function line(x: number, z: number, sizeX: number, sizeZ: number, y: number): Box {
  return { position: [x, y, z], size: [sizeX, LINE_THICKNESS, sizeZ] }
}

/** Painted markings only, flat enough that the drone lands on them as it would on the floor. */
export function FlightArea({ area }: { area: FlightAreaSize }) {
  const { width, depth } = area
  const halfX = width / 2
  const halfZ = depth / 2

  const { grid, edges, corners } = useMemo(() => {
    const steps = (half: number) => {
      const values: number[] = []
      for (let value = GRID_SPACING; value < half; value += GRID_SPACING) values.push(value, -value)
      return values
    }

    const corners = [-1, 1].flatMap((signX) =>
      [-1, 1].flatMap((signZ): Box[] => {
        const x = signX * halfX
        const z = signZ * halfZ
        return [
          line(x - (signX * CORNER_LENGTH) / 2, z, CORNER_LENGTH, CORNER_WIDTH, LINE_HEIGHTS.corner),
          line(x, z - (signZ * CORNER_LENGTH) / 2, CORNER_WIDTH, CORNER_LENGTH, LINE_HEIGHTS.corner),
        ]
      }),
    )

    return {
      grid: [
        ...steps(halfZ).map((z) => line(0, z, width, GRID_WIDTH, LINE_HEIGHTS.grid)),
        ...steps(halfX).map((x) => line(x, 0, GRID_WIDTH, depth, LINE_HEIGHTS.grid)),
      ],
      edges: [
        line(0, -halfZ, width, EDGE_WIDTH, LINE_HEIGHTS.edge),
        line(0, halfZ, width, EDGE_WIDTH, LINE_HEIGHTS.edge),
        line(-halfX, 0, EDGE_WIDTH, depth, LINE_HEIGHTS.edge),
        line(halfX, 0, EDGE_WIDTH, depth, LINE_HEIGHTS.edge),
      ],
      corners,
    }
  }, [width, depth, halfX, halfZ])

  return (
    <group name="FlightArea" position-y={GROUND_HEIGHT}>
      <InstancedBoxes boxes={grid} material={HALL_MATERIALS.floorLine} />
      <InstancedBoxes boxes={edges} material={HALL_MATERIALS.floorLineAccent} />
      <InstancedBoxes boxes={corners} material={HALL_MATERIALS.secondaryAccent} />
      <FlightBoundary area={area} color={HALL_COLORS.accent} />
    </group>
  )
}
