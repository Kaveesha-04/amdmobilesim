import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { HALL, HALL_COLORS, FIXTURE_LINES } from '../../config/hall'

const FONT = "system-ui, 'Segoe UI', Roboto, Arial, sans-serif"
const FLOOR_TILE_METRES = 5

type Draw = (context: CanvasRenderingContext2D, width: number, height: number) => void

/** Drawn on the page rather than loaded, so the hall needs no files or fonts from the network. */
function createTexture(width: number, height: number, draw: Draw) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (context) draw(context, width, height)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Each texture is made once and shared between modes. */
function once(create: () => CanvasTexture) {
  let texture: CanvasTexture | undefined
  return () => (texture ??= create())
}

/** A polished tile with a fine seam around it. */
export const getFloorTexture = once(() => {
  const texture = createTexture(512, 512, (context, width, height) => {
    context.fillStyle = '#131B2B'
    context.fillRect(0, 0, width, height)
    context.strokeStyle = '#2B3A52'
    context.lineWidth = 3
    context.strokeRect(0, 0, width, height)
    context.strokeStyle = 'rgba(43, 58, 82, 0.35)'
    context.lineWidth = 1
    context.beginPath()
    context.moveTo(width / 2, 0)
    context.lineTo(width / 2, height)
    context.moveTo(0, height / 2)
    context.lineTo(width, height / 2)
    context.stroke()
  })
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.setScalar(HALL.size / FLOOR_TILE_METRES)
  texture.anisotropy = 8
  return texture
})

/** Stands in for real-time reflections: the ceiling lights as soft smears on the polished floor. */
export const getFloorSheenTexture = once(() =>
  createTexture(1024, 1024, (context, width) => {
    const metresToPixels = width / HALL.size
    context.fillStyle = '#000'
    context.fillRect(0, 0, width, width)

    const smear = (x: number, z: number, radiusX: number, radiusZ: number, color: string) => {
      context.save()
      context.translate((x + HALL.size / 2) * metresToPixels, (z + HALL.size / 2) * metresToPixels)
      context.scale(radiusX * metresToPixels, radiusZ * metresToPixels)
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1)
      gradient.addColorStop(0, color)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      context.fillStyle = gradient
      context.fillRect(-1, -1, 2, 2)
      context.restore()
    }

    FIXTURE_LINES.forEach((x) =>
      FIXTURE_LINES.forEach((z) => smear(x, z, 4.5, 2.2, 'rgba(150, 165, 190, 0.2)')),
    )
    smear(0, 0, 7, 7, 'rgba(102, 213, 117, 0.16)')
  }),
)

/** MoonLady Beta 1, twice around a circle. Read from outside, with the letter tops towards the centre. */
export const getBrandRingTexture = once(() =>
  createTexture(1024, 1024, (context, size) => {
    const centre = size / 2
    const baseline = 438
    const text = 'MOONLADY BETA 1   •   '.repeat(2)

    context.fillStyle = '#000'
    context.fillRect(0, 0, size, size)
    context.font = `700 70px ${FONT}`
    context.textAlign = 'center'
    context.fillStyle = '#D8F5DC'

    const totalWidth = context.measureText(text).width
    let angle = (-context.measureText('MOONLADY BETA 1').width / 2 / totalWidth) * Math.PI * 2
    for (const letter of text) {
      const advance = (context.measureText(letter).width / totalWidth) * Math.PI * 2
      const middle = angle + advance / 2
      context.save()
      context.translate(centre + Math.sin(middle) * baseline, centre + Math.cos(middle) * baseline)
      context.rotate(-middle)
      context.fillText(letter, 0, 0)
      context.restore()
      angle += advance
    }
  }),
)

/** Light washing up the wall from the floor. Only the alpha fades, as fading the colour too adds a bright band. */
export const getWallWashTexture = once(() =>
  createTexture(32, 256, (context, width, height) => {
    const gradient = context.createLinearGradient(0, height, 0, 0)
    gradient.addColorStop(0, 'rgba(120, 150, 190, 0.28)')
    gradient.addColorStop(1, 'rgba(120, 150, 190, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
  }),
)

/** The light behind the glass sections, as though from a brighter space beyond. */
export const getGlassBacklightTexture = once(() =>
  createTexture(32, 256, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#1A3A52')
    gradient.addColorStop(0.65, '#10263B')
    gradient.addColorStop(1, '#0A1626')
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
  }),
)

export interface DisplayContent {
  title: string
  subtitle: string
  graphic: 'brand' | 'chip' | 'waves' | 'axes' | 'field'
}

const GRAPHICS: Record<DisplayContent['graphic'], Draw> = {
  brand(context, width, height) {
    // A simplified quadcopter from above.
    const y = height * 0.72
    const arm = 90
    context.lineWidth = 8
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      context.beginPath()
      context.moveTo(width / 2, y)
      context.lineTo(width / 2 + dx * arm * 1.4, y + dy * arm * 0.6)
      context.stroke()
      context.beginPath()
      context.ellipse(width / 2 + dx * arm * 1.4, y + dy * arm * 0.6, 52, 13, 0, 0, Math.PI * 2)
      context.stroke()
    }
    context.fillRect(width / 2 - 26, y - 20, 52, 40)
  },
  chip(context, width, height) {
    const size = 170
    const x = width / 2 - size / 2
    const y = height * 0.66 - size / 2
    context.lineWidth = 6
    context.strokeRect(x, y, size, size)
    context.strokeRect(x + 45, y + 45, size - 90, size - 90)
    for (let i = 0; i < 5; i++) {
      const offset = 25 + i * 30
      context.fillRect(x + offset - 4, y - 24, 8, 18)
      context.fillRect(x + offset - 4, y + size + 6, 8, 18)
      context.fillRect(x - 24, y + offset - 4, 18, 8)
      context.fillRect(x + size + 6, y + offset - 4, 18, 8)
    }
  },
  waves(context, width, height) {
    const x = width / 2
    const y = height * 0.82
    context.lineWidth = 8
    context.lineCap = 'round'
    for (const radius of [55, 105, 155]) {
      context.beginPath()
      context.arc(x, y, radius, -Math.PI * 0.8, -Math.PI * 0.2)
      context.stroke()
    }
    context.beginPath()
    context.arc(x, y, 14, 0, Math.PI * 2)
    context.fill()
  },
  axes(context, width, height) {
    const x = width / 2
    const y = height * 0.74
    context.lineWidth = 7
    context.font = `600 34px ${FONT}`
    context.textAlign = 'center'
    const axes: [number, number, string][] = [[-170, 40, 'ROLL'], [170, 40, 'PITCH'], [0, -120, 'YAW']]
    for (const [dx, dy, label] of axes) {
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + dx, y + dy)
      context.stroke()
      context.fillText(label, x + dx * 1.05, y + dy + (dy < 0 ? -14 : 48))
    }
  },
  field(context, width, height) {
    const x = width / 2
    const y = height * 0.68
    context.lineWidth = 4
    for (const scale of [0.4, 0.7, 1]) {
      for (const side of [-1, 1]) {
        context.beginPath()
        context.ellipse(x + side * 150 * scale, y, 150 * scale, 92 * scale, 0, 0, Math.PI * 2)
        context.stroke()
      }
    }
    context.fillRect(x - 54, y - 13, 108, 26)
  },
}

function drawDisplay({ title, subtitle, graphic }: DisplayContent): Draw {
  return (context, width, height) => {
    const background = context.createLinearGradient(0, 0, 0, height)
    background.addColorStop(0, '#132033')
    background.addColorStop(1, '#090F1C')
    context.fillStyle = background
    context.fillRect(0, 0, width, height)

    context.fillStyle = HALL_COLORS.accent
    context.fillRect(0, 0, width, 10)

    context.textAlign = 'center'
    context.fillStyle = '#F8FAFC'
    context.font = `700 ${title.length > 18 ? 68 : 84}px ${FONT}`
    context.fillText(title, width / 2, 125)
    context.fillStyle = HALL_COLORS.accent
    context.font = `500 44px ${FONT}`
    context.fillText(subtitle, width / 2, 190)

    context.strokeStyle = 'rgba(102, 213, 117, 0.85)'
    context.fillStyle = 'rgba(102, 213, 117, 0.85)'
    GRAPHICS[graphic](context, width, height)
  }
}

const displayTextures = new Map<string, CanvasTexture>()

export function getDisplayTexture(content: DisplayContent) {
  let texture = displayTextures.get(content.title)
  if (!texture) {
    texture = createTexture(1024, 576, drawDisplay(content))
    displayTextures.set(content.title, texture)
  }
  return texture
}
