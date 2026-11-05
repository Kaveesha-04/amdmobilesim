import { MeshBasicMaterial, type Vector3Tuple } from 'three'
import { HALL } from '../../config/hall'
import { HALL_MATERIALS } from './hallMaterials'
import { getDisplayTexture, getEventBannerTexture, type DisplayContent } from './hallTextures'
import { InstancedBoxes, type Box } from './InstancedBoxes'

const WALL = HALL.size / 2
const MOUNT_DEPTH = 0.34
const FRAME_MARGIN = 0.14
const ON_NORTH_WALL = 0
const ON_WEST_WALL = Math.PI / 2

interface Placement {
  position: Vector3Tuple
  /** Turns the screen to face into the hall. */
  rotationY: number
  width: number
  /** Defaults to 16:9. */
  height?: number
}

interface Display extends DisplayContent, Placement {}

const DISPLAYS: Display[] = [
  {
    title: 'Adaptable and Modular Drone',
    subtitle: 'A Drone from Sketch',
    graphic: 'brand',
    position: [0, 4.2, -WALL + MOUNT_DEPTH],
    rotationY: ON_NORTH_WALL,
    width: 10,
  },
  {
    title: 'Flight Controller',
    subtitle: 'MoonLady Beta 1',
    graphic: 'chip',
    position: [-15, 4, -WALL + MOUNT_DEPTH],
    rotationY: ON_NORTH_WALL,
    width: 8,
  },
  {
    title: 'Drone Software Suite',
    subtitle: 'Aeronexus Flight v1',
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

/** Directly above the main screen and as wide, so the two read as one exhibit. */
const EVENT_BANNER: Placement = {
  position: [0, 9, -WALL + MOUNT_DEPTH],
  rotationY: ON_NORTH_WALL,
  width: 10,
  height: 2.5,
}

const heightOf = ({ width, height }: Placement) => height ?? (width * 9) / 16

/** The frame behind a screen and the strip of light under it. */
function aroundDisplay(placement: Placement) {
  const { position: [x, y, z], rotationY, width } = placement
  const height = heightOf(placement)
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

const PLACEMENTS = [...DISPLAYS, EVENT_BANNER]
const FRAMES = PLACEMENTS.map((placement) => aroundDisplay(placement).frame)
const STRIPS = PLACEMENTS.map((placement) => aroundDisplay(placement).strip)

const screenMaterials = new Map<string, MeshBasicMaterial>()
let eventBannerMaterial: MeshBasicMaterial | undefined

function getScreenMaterial(display: Display) {
  let material = screenMaterials.get(display.title)
  if (!material) {
    // Self-lit, as a screen is, so it stays readable however the hall is lit.
    material = new MeshBasicMaterial({ map: getDisplayTexture(display), toneMapped: false })
    screenMaterials.set(display.title, material)
  }
  return material
}

function Screen({ placement, material }: { placement: Placement; material: MeshBasicMaterial }) {
  return (
    <mesh position={placement.position} rotation-y={placement.rotationY} material={material}>
      <planeGeometry args={[placement.width, heightOf(placement)]} />
    </mesh>
  )
}

/** Decorative wall screens. Each screen's picture is drawn once, and doesn't change. */
export function InformationDisplays() {
  eventBannerMaterial ??= new MeshBasicMaterial({ map: getEventBannerTexture(), toneMapped: false })

  return (
    <group name="InformationDisplays">
      <InstancedBoxes boxes={FRAMES} material={HALL_MATERIALS.structure} />
      <InstancedBoxes boxes={STRIPS} material={HALL_MATERIALS.accent} />
      {DISPLAYS.map((display) => (
        <Screen key={display.title} placement={display} material={getScreenMaterial(display)} />
      ))}
      <Screen placement={EVENT_BANNER} material={eventBannerMaterial} />
    </group>
  )
}
