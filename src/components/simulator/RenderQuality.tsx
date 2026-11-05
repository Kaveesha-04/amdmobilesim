import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import type { GraphicsQuality } from '../../stores/displayPreferences'

/** Pixels drawn per screen pixel. Above 2, sharper rendering costs far more than it shows. */
const RESOLUTION: Record<GraphicsQuality, () => number> = {
  high: () => Math.min(window.devicePixelRatio, 2),
  balanced: () => 1,
  performance: () => 0.75,
}

/** Goes inside the canvas, where it can change the resolution without rebuilding the scene. */
export function RenderQuality() {
  const { graphicsQuality } = useDisplayPreferences()
  const setDpr = useThree((state) => state.setDpr)
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    setDpr(RESOLUTION[graphicsQuality]())
    invalidate()
  }, [graphicsQuality, setDpr, invalidate])

  return null
}
