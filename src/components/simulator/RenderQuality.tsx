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

/**
 * The drone's clear acrylic plate makes the renderer redraw the scene behind it every
 * frame. This small a detail doesn't need that at full resolution.
 */
const TRANSMISSION_RESOLUTION_SCALE = 0.5

/** Set on the Canvas itself, which would otherwise put back its own default when it renders. */
export const getRenderResolution = (quality: GraphicsQuality) => RESOLUTION[quality]()

/** Goes inside the canvas, where it can reach the renderer. */
export function RenderQuality() {
  const { graphicsQuality } = useDisplayPreferences()
  const invalidate = useThree((state) => state.invalidate)
  const renderer = useThree((state) => state.gl)

  useEffect(() => {
    renderer.transmissionResolutionScale = TRANSMISSION_RESOLUTION_SCALE
  }, [renderer])

  useEffect(() => {
    invalidate()
  }, [graphicsQuality, invalidate])

  return null
}
