import { Sky as DreiSky } from '@react-three/drei'
import { SUN_OFFSET } from '../../config/world'

export function Sky() {
  return (
    <DreiSky
      distance={2000}
      sunPosition={SUN_OFFSET}
      turbidity={2.5}
      rayleigh={1.4}
      mieCoefficient={0.003}
      mieDirectionalG={0.75}
    />
  )
}
