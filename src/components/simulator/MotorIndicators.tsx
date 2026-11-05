import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import {
  BufferGeometry,
  CanvasTexture,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  MathUtils,
  Vector3,
  type Group,
  type Mesh,
  type Texture,
} from 'three'
import { FLIGHT_CAMERA } from '../../config/camera'
import { DRONE_SIZE, PROPELLERS } from '../../config/flight'
import { HALL_COLORS } from '../../config/hall'
import { readMotor } from '../../features/artificial-mode/motorReadings'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import type { FlightStore } from '../../stores/flightStore'

/** All in metres at the default camera distance, except the scale limits. */
const PANEL_WIDTH = 0.24
const PANEL_HEIGHT = 0.09
/** How far beyond the propeller tips the panel's near edge sits, so that it never covers the blades. */
const CLEARANCE = 0.02
/** Front panels sit higher, so that they don't overlap the rear ones as seen from behind the drone. */
const LIFT_FRONT = 0.2
const LIFT_REAR = 0.06
/** Outward from the drone. Mostly sideways, as the camera usually trails behind it. */
const OUTWARD_X = 0.85
const OUTWARD_Z = 0.5

/**
 * Each panel grows with its own distance from the camera, which holds it at about the
 * same size on screen, but only within these limits. Very far away it shrinks with the
 * rest of the scene, rather than dwarf the drone.
 */
const MIN_SCALE = 0.2
const MAX_SCALE = 4

const CANVAS_WIDTH = 384
const CANVAS_HEIGHT = 144
/** The bar's place on the panel, as shares of its width and height, with y measured from the top. */
const BAR = { left: 0.0625, width: 0.875, top: 0.62, height: 0.2 }

const BAR_WIDTH = PANEL_WIDTH * BAR.width
const BAR_LEFT = PANEL_WIDTH * (BAR.left - 0.5)
const BAR_HEIGHT = PANEL_HEIGHT * BAR.height
const BAR_Y = PANEL_HEIGHT * (0.5 - BAR.top - BAR.height / 2)
const GLOW_HEIGHT = BAR_HEIGHT * 1.9

const PANEL_FONT = '600 60px system-ui, sans-serif'
/** The middle of the row holding the label and percentage, as a share of the height from the top. */
const TEXT_ROW = 0.33

/** The parts of a panel that never change. The fill and percentage are separate meshes, so that they can change without uploading a texture. */
function createPanelTexture(motor: number) {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  const context = canvas.getContext('2d')

  if (context) {
    context.beginPath()
    context.roundRect(3, 3, CANVAS_WIDTH - 6, CANVAS_HEIGHT - 6, 14)
    context.fillStyle = 'rgba(8, 13, 24, 0.72)'
    context.fill()
    context.lineWidth = 3
    context.strokeStyle = HALL_COLORS.accentGlow
    context.stroke()

    context.textBaseline = 'middle'
    context.font = PANEL_FONT
    context.fillStyle = HALL_COLORS.displayLight
    context.fillText(`M${motor}`, CANVAS_WIDTH * BAR.left, CANVAS_HEIGHT * TEXT_ROW)

    context.beginPath()
    context.roundRect(
      CANVAS_WIDTH * BAR.left,
      CANVAS_HEIGHT * BAR.top,
      CANVAS_WIDTH * BAR.width,
      CANVAS_HEIGHT * BAR.height,
      4,
    )
    context.fillStyle = 'rgba(255, 255, 255, 0.12)'
    context.fill()
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = 'srgb'
  return texture
}

const ATLAS_COLUMNS = 11
const ATLAS_ROWS = 10
const ATLAS_CELL_WIDTH = 168
const ATLAS_CELL_HEIGHT = 72

/**
 * "0%" to "100%" drawn once, for all the panels to share. Uploading a canvas each time
 * a percentage changed cost about 15% of the frame rate in testing. Showing another
 * part of this image costs nothing.
 */
const getPercentAtlas = (() => {
  let atlas: CanvasTexture | null = null

  return () => {
    if (atlas) return atlas

    const canvas = document.createElement('canvas')
    canvas.width = ATLAS_COLUMNS * ATLAS_CELL_WIDTH
    canvas.height = ATLAS_ROWS * ATLAS_CELL_HEIGHT
    const context = canvas.getContext('2d')

    if (context) {
      context.font = PANEL_FONT
      context.fillStyle = HALL_COLORS.accentLight
      context.textAlign = 'right'
      context.textBaseline = 'middle'
      for (let percent = 0; percent <= 100; percent++) {
        const column = percent % ATLAS_COLUMNS
        const row = Math.floor(percent / ATLAS_COLUMNS)
        context.fillText(
          `${percent}%`,
          (column + 1) * ATLAS_CELL_WIDTH - 4,
          (row + 0.5) * ATLAS_CELL_HEIGHT,
        )
      }
    }

    atlas = new CanvasTexture(canvas)
    atlas.colorSpace = 'srgb'
    return atlas
  }
})()

/** A view of the shared image, showing one percentage. It reuses the image's memory on the GPU. */
function createPercentTexture() {
  const texture = getPercentAtlas().clone()
  texture.repeat.set(1 / ATLAS_COLUMNS, 1 / ATLAS_ROWS)
  texture.needsUpdate = true
  showPercent(texture, 0)
  return texture
}

function showPercent(texture: Texture, percent: number) {
  const column = percent % ATLAS_COLUMNS
  const row = Math.floor(percent / ATLAS_COLUMNS)
  texture.offset.set(column / ATLAS_COLUMNS, 1 - (row + 1) / ATLAS_ROWS)
}

const PERCENT_WIDTH = (PANEL_WIDTH * ATLAS_CELL_WIDTH) / CANVAS_WIDTH
const PERCENT_HEIGHT = (PANEL_HEIGHT * ATLAS_CELL_HEIGHT) / CANVAS_HEIGHT
const PERCENT_X = PANEL_WIDTH * (BAR.left + BAR.width - 0.5) - PERCENT_WIDTH / 2
const PERCENT_Y = PANEL_HEIGHT * (0.5 - TEXT_ROW)

function createLeader() {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(new Float32Array(6), 3))
  const material = new LineBasicMaterial({
    color: HALL_COLORS.accent,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    fog: false,
    toneMapped: false,
  })
  return new Line(geometry, material)
}

interface MotorIndicatorProps {
  store: FlightStore
  index: number
}

/**
 * One motor's panel, placed in the drone's own coordinates so that it moves with the
 * drone. It banks and pitches with the drone too, but turns about the drone's axes to
 * face the camera, as a panel fixed flat to the airframe would be mirrored or edge-on
 * from most angles.
 */
function MotorIndicator({ store, index }: MotorIndicatorProps) {
  const { name, motor, side, end } = PROPELLERS[index]
  const panel = useRef<Group>(null)
  const fill = useRef<Mesh>(null)
  const glow = useRef<Mesh>(null)
  const anchor = useRef<Vector3 | null>(null)
  const [panelTexture] = useState(() => createPanelTexture(motor))
  const [percentTexture] = useState(createPercentTexture)
  const [leader] = useState(createLeader)
  const [camera] = useState(() => new Vector3())

  // Taken from the model rather than assumed, so that the panel can't drift from its motor.
  useEffect(() => {
    const body = panel.current?.parent
    const propeller = body?.getObjectByName(name)
    if (!body || !propeller) {
      console.error(`No motor indicator for ${name}, which is missing from the model`)
      return
    }
    body.updateWorldMatrix(true, true)
    anchor.current = body.worldToLocal(propeller.getWorldPosition(new Vector3()))
  }, [name])

  useEffect(
    () => () => {
      panelTexture.dispose()
      percentTexture.dispose()
      leader.geometry.dispose()
      leader.material.dispose()
    },
    [panelTexture, percentTexture, leader],
  )

  useFrame((state) => {
    const group = panel.current
    const base = anchor.current
    if (!group || !base) return
    group.visible = true

    // The actual output the simulation worked out, not a copy with its own easing.
    const reading = readMotor(store.motors[index] ?? 0)
    const width = BAR_WIDTH * reading.output
    for (const bar of [fill.current, glow.current]) {
      if (!bar) continue
      bar.visible = reading.output > 0
      bar.scale.x = Math.max(width, 1e-5)
      bar.position.x = BAR_LEFT + width / 2
    }
    showPercent(percentTexture, reading.percent)

    const body = group.parent
    if (!body) return
    body.worldToLocal(camera.copy(state.camera.position))

    const scale = MathUtils.clamp(camera.distanceTo(base) / FLIGHT_CAMERA.defaultDistance, MIN_SCALE, MAX_SCALE)
    const reach = DRONE_SIZE.reach - Math.hypot(base.x, base.z) + CLEARANCE + (PANEL_WIDTH * scale) / 2
    group.scale.setScalar(scale)
    group.position.set(
      base.x + side * OUTWARD_X * reach,
      base.y + (end < 0 ? LIFT_FRONT : LIFT_REAR) * scale,
      base.z + end * OUTWARD_Z * reach,
    )

    camera.sub(group.position)
    group.rotation.set(-Math.atan2(camera.y, Math.hypot(camera.x, camera.z)), Math.atan2(camera.x, camera.z), 0)

    leader.geometry.attributes.position.setXYZ(0, base.x, base.y, base.z)
    leader.geometry.attributes.position.setXYZ(1, group.position.x, group.position.y, group.position.z)
    leader.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      <primitive object={leader} name={`MotorIndicatorLeader_${motor}`} frustumCulled={false} />
      <group
        ref={panel}
        name={`MotorIndicator_${motor}`}
        rotation-order="YXZ"
        visible={false}
      >
        <mesh name="Panel" renderOrder={1}>
          <planeGeometry args={[PANEL_WIDTH, PANEL_HEIGHT]} />
          <meshBasicMaterial map={panelTexture} transparent depthWrite={false} fog={false} toneMapped={false} />
        </mesh>
        <mesh ref={glow} name="Glow" position-y={BAR_Y} scale-y={GLOW_HEIGHT} visible={false} renderOrder={2}>
          <planeGeometry />
          <meshBasicMaterial
            color={HALL_COLORS.accent}
            transparent
            opacity={0.3}
            depthWrite={false}
            fog={false}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={fill} name="Fill" position-y={BAR_Y} scale-y={BAR_HEIGHT} visible={false} renderOrder={3}>
          <planeGeometry />
          <meshBasicMaterial color={HALL_COLORS.accent} transparent depthWrite={false} fog={false} toneMapped={false} />
        </mesh>
        <mesh name="Percent" position={[PERCENT_X, PERCENT_Y, 0]} renderOrder={4}>
          <planeGeometry args={[PERCENT_WIDTH, PERCENT_HEIGHT]} />
          <meshBasicMaterial map={percentTexture} transparent depthWrite={false} fog={false} toneMapped={false} />
        </mesh>
      </group>
    </>
  )
}

/**
 * A small display beside each motor showing the output the simulation works out for
 * it. Put this inside the group that carries the drone. It's only used in Artificial
 * Mode, as Natural Mode has no measured motor speeds to show.
 */
export function MotorIndicators({ store }: { store: FlightStore }) {
  const { showMotorIndicators } = useDisplayPreferences()
  const invalidate = useThree((state) => state.invalidate)

  // The scene renders on demand, so with the drone idle nothing else would redraw it.
  useEffect(() => invalidate(), [showMotorIndicators, invalidate])

  if (!showMotorIndicators) return null

  return (
    <>
      {PROPELLERS.map(({ motor }, index) => (
        <MotorIndicator key={motor} store={store} index={index} />
      ))}
    </>
  )
}
