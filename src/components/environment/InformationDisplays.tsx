import { MeshBasicMaterial, type Vector3Tuple } from 'three'
import { HALL } from '../../config/hall'
import { HALL_MATERIALS } from './hallMaterials'
import { getDisplayTexture, type DisplayContent } from './hallTextures'
import { InstancedBoxes, type Box } from './InstancedBoxes'

const WALL = HALL.size / 2
const MOUNT_DEPTH = 0.34
const FRAME_MARGIN = 0.14
const ON_NORTH_WALL = 0
const ON_WEST_WALL = Math.PI / 2

interface Display extends DisplayContent {
  position: Vector3Tuple
  /** Turns the screen to face into the hall. */
  rotationY: number
  width: number
}

const DISPLAYS: Display[] = [
  {
    title: 'MoonLady Beta 1',
    subtitle: 'Aerospace Drone Exhibit',
    graphic: 'brand',
    position: [0, 4.2, -WALL + MOUNT_DEPTH],
    rotationY: ON_NORTH_WALL,
    width: 10,
  },
  {
    title: 'Flight Controller',
    subtitle: 'STM32H7',
    graphic: 'chip',
    position: [-15, 4, -WALL + MOUNT_DEPTH],
    rotationY: ON_NORTH_WALL,
    width: 8,
  },
  {
    title: 'Wireless Communication',
    subtitle: 'Drone to Ground Link',
    graphic: 'waves',
    position: [15, 4, -WALL + MOUNT_DEPTH],
    rotationY: ON_NORTH_WALL,
    width: 8,
  },
  {
    title: 'Sensor Technologies',
    subtitle: 'Live Orientation',
    graphic: 'axes',
    position: [-WALL + MOUNT_DEPTH, 4, -10],
    rotationY: ON_WEST_WALL,
    width: 8,
  },
  {
    title: 'Magnetic Field Visualization',
    subtitle: 'Field Lines',
    graphic: 'field',
    position: [-WALL + MOUNT_DEPTH, 4, 10],
    rotationY: ON_WEST_WALL,
    width: 8,
  },
]

const heightOf = (width: number) => (width * 9) / 16

/** The frame behind a screen and the strip of light under it. */
function aroundDisplay({ position: [x, y, z], rotationY, width }: Display) {
  const height = heightOf(width)
  const onNorthWall = rotationY === ON_NORTH_WALL
  const sized = (across: number, tall: number, deep: number): Vector3Tuple =>
    onNorthWall ? [across, tall, deep] : [deep, tall, across]

  const frame: Box = {
    // Its front is just behind the screen, so the two can't flicker through each other.
    position: onNorthWall ? [x, y, z - 0.06] : [x - 0.06, y, z],
    size: sized(width + FRAME_MARGIN * 2, height + FRAME_MARGIN * 2, 0.1),
  }
  const strip: Box = {
    position: [x, y - height / 2 - FRAME_MARGIN - 0.1, z],
    size: sized(width, 0.05, 0.06),
  }
  return { frame, strip }
}

const FRAMES = DISPLAYS.map((display) => aroundDisplay(display).frame)
const STRIPS = DISPLAYS.map((display) => aroundDisplay(display).strip)

const screenMaterials = new Map<string, MeshBasicMaterial>()

function getScreenMaterial(display: Display) {
  let material = screenMaterials.get(display.title)
  if (!material) {
    // Self-lit, as a screen is, so it stays readable however the hall is lit.
    material = new MeshBasicMaterial({ map: getDisplayTexture(display), toneMapped: false })
    screenMaterials.set(display.title, material)
  }
  return material
}

/** Decorative wall screens. Each screen's picture is drawn once, and doesn't change. */
export function InformationDisplays() {
  return (
    <group name="InformationDisplays">
      <InstancedBoxes boxes={FRAMES} material={HALL_MATERIALS.structure} />
      <InstancedBoxes boxes={STRIPS} material={HALL_MATERIALS.accent} />
      {DISPLAYS.map((display) => (
        <mesh
          key={display.title}
          position={display.position}
          rotation-y={display.rotationY}
          material={getScreenMaterial(display)}
        >
          <planeGeometry args={[display.width, heightOf(display.width)]} />
        </mesh>
      ))}
    </group>
  )
}
