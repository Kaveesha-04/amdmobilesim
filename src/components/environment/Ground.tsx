import { Grid } from '@react-three/drei'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { GROUND_HEIGHT } from '../../config/world'

const GROUND_SIZE = 800
const TEXTURE_PIXELS = 256
const TEXTURE_TILE_METRES = 4

let grassTexture: CanvasTexture | undefined

/** Speckled light and dark, so that the ground isn't flat. Created once and shared between modes. */
function getGrassTexture() {
  if (grassTexture) return grassTexture

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = TEXTURE_PIXELS
  const context = canvas.getContext('2d')
  if (context) {
    const image = context.createImageData(TEXTURE_PIXELS, TEXTURE_PIXELS)
    for (let i = 0; i < image.data.length; i += 4) {
      const shade = 200 + Math.random() * 55
      image.data.set([shade, shade, shade, 255], i)
    }
    context.putImageData(image, 0, 0)
  }

  grassTexture = new CanvasTexture(canvas)
  grassTexture.colorSpace = SRGBColorSpace
  grassTexture.wrapS = grassTexture.wrapT = RepeatWrapping
  grassTexture.repeat.setScalar(GROUND_SIZE / TEXTURE_TILE_METRES)
  grassTexture.anisotropy = 4
  return grassTexture
}

export function Ground() {
  return (
    <group position={[0, GROUND_HEIGHT, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#4a6339" map={getGrassTexture()} envMapIntensity={0.3} />
      </mesh>
      {/* Lifted slightly to avoid z-fighting with the plane. */}
      <Grid
        args={[GROUND_SIZE, GROUND_SIZE]}
        position={[0, 0.01, 0]}
        cellColor="#5f7a4d"
        sectionColor="#86a074"
        cellSize={1}
        sectionSize={10}
        fadeDistance={70}
      />
    </group>
  )
}
