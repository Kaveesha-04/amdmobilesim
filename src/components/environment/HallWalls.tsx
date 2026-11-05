import { MeshBasicMaterial } from 'three'
import { HALL } from '../../config/hall'
import { createGlowMaterial, HALL_MATERIALS } from './hallMaterials'
import { getGlassBacklightTexture, getWallWashTexture } from './hallTextures'
import { InstancedBoxes, type Box } from './InstancedBoxes'

type Wall = 'north' | 'south' | 'west' | 'east'

const WALLS: Wall[] = ['north', 'south', 'west', 'east']
const HALF = HALL.size / 2
const BAY_WIDTH = 5
const BAY_CENTRES = Array.from({ length: 12 }, (_, index) => -27.5 + index * BAY_WIDTH)
const PANEL_ROWS = [
  { bottom: 0.7, top: 5 },
  { bottom: 5, top: 9.3 },
  { bottom: 9.3, top: 13.6 },
]
const CLERESTORY = { bottom: 13.8, top: 16.4 }
/** The east wall is glass across this distance either side of its centre. */
const EAST_GLASS_HALF_WIDTH = 15

/**
 * A box against a wall, given by where it is along the wall, its height and how far
 * it stands out from the wall. North is -Z, the way the drone faces at the start.
 */
function onWall(wall: Wall, along: number, y: number, inset: number, size: [number, number, number]): Box {
  const [width, height, depth] = size
  switch (wall) {
    case 'north':
      return { position: [along, y, -HALF + inset], size: [width, height, depth] }
    case 'south':
      return { position: [along, y, HALF - inset], size: [width, height, depth] }
    case 'west':
      return { position: [-HALF + inset, y, along], size: [depth, height, width] }
    case 'east':
      return { position: [HALF - inset, y, along], size: [depth, height, width] }
  }
}

const isEastGlass = (wall: Wall, along: number) =>
  wall === 'east' && Math.abs(along) < EAST_GLASS_HALF_WIDTH

const clerestoryY = (CLERESTORY.bottom + CLERESTORY.top) / 2
const clerestoryHeight = CLERESTORY.top - CLERESTORY.bottom
const eastGlassHeight = PANEL_ROWS[2].top - PANEL_ROWS[0].bottom
const eastGlassY = (PANEL_ROWS[2].top + PANEL_ROWS[0].bottom) / 2

const SHELL = WALLS.map((wall) =>
  onWall(wall, 0, HALL.height / 2, -0.2, [HALL.size + 0.4, HALL.height, 0.4]),
)

const PANELS = WALLS.flatMap((wall) =>
  BAY_CENTRES.filter((along) => !isEastGlass(wall, along)).flatMap((along) =>
    PANEL_ROWS.map(({ bottom, top }) =>
      onWall(wall, along, (bottom + top) / 2, 0.06, [BAY_WIDTH - 0.08, top - bottom - 0.08, 0.12]),
    ),
  ),
)

const STRUCTURE = WALLS.flatMap((wall) => [
  // Skirting, and the rail under the high glass.
  onWall(wall, 0, 0.35, 0.1, [HALL.size, 0.7, 0.2]),
  onWall(wall, 0, 13.7, 0.14, [HALL.size, 0.2, 0.28]),
  onWall(wall, 0, CLERESTORY.top + 0.1, 0.14, [HALL.size, 0.2, 0.28]),
  // Fins between the bays.
  ...[...BAY_CENTRES.map((along) => along - BAY_WIDTH / 2), HALF].flatMap((along) => [
    onWall(wall, along, 7, 0.16, [0.16, 13.4, 0.32]),
    onWall(wall, along, clerestoryY, 0.12, [0.1, clerestoryHeight, 0.24]),
  ]),
])

const BACKLIGHT = [
  ...WALLS.map((wall) => onWall(wall, 0, clerestoryY, 0.02, [HALL.size, clerestoryHeight, 0.02])),
  onWall('east', 0, eastGlassY, 0.02, [EAST_GLASS_HALF_WIDTH * 2, eastGlassHeight, 0.02]),
]

const GLASS = [
  ...WALLS.map((wall) => onWall(wall, 0, clerestoryY, 0.1, [HALL.size, clerestoryHeight, 0.02])),
  onWall('east', 0, eastGlassY, 0.1, [EAST_GLASS_HALF_WIDTH * 2, eastGlassHeight, 0.02]),
]

const WASH_HEIGHT = 7
const WASH_Y = PANEL_ROWS[0].bottom + WASH_HEIGHT / 2
const WALL_WASH = WALLS.flatMap((wall): Box[] =>
  wall === 'east'
    ? [-1, 1].map((side) =>
        onWall(wall, side * (HALF + EAST_GLASS_HALF_WIDTH) / 2, WASH_Y, 0.13, [HALF - EAST_GLASS_HALF_WIDTH, WASH_HEIGHT, 0.01]),
      )
    : [onWall(wall, 0, WASH_Y, 0.13, [HALL.size, WASH_HEIGHT, 0.01])],
)

const LED_STRIPS = WALLS.map((wall) => onWall(wall, 0, 0.74, 0.1, [HALL.size, 0.05, 0.05]))

let backlightMaterial: MeshBasicMaterial | undefined
let washMaterial: ReturnType<typeof createGlowMaterial> | undefined

export function HallWalls() {
  backlightMaterial ??= new MeshBasicMaterial({ map: getGlassBacklightTexture(), toneMapped: false })
  washMaterial ??= createGlowMaterial(getWallWashTexture())

  return (
    <group name="HallWalls">
      <InstancedBoxes boxes={SHELL} material={HALL_MATERIALS.wall} />
      <InstancedBoxes boxes={PANELS} material={HALL_MATERIALS.wallPanel} />
      <InstancedBoxes boxes={STRUCTURE} material={HALL_MATERIALS.structure} />
      <InstancedBoxes boxes={BACKLIGHT} material={backlightMaterial} />
      <InstancedBoxes boxes={GLASS} material={HALL_MATERIALS.glass} />
      <InstancedBoxes boxes={WALL_WASH} material={washMaterial} />
      <InstancedBoxes boxes={LED_STRIPS} material={HALL_MATERIALS.accent} />
    </group>
  )
}
