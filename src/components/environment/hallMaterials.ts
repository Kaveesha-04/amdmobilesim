import { AdditiveBlending, BackSide, MeshBasicMaterial, MeshLambertMaterial, MeshStandardMaterial } from 'three'
import { HALL_COLORS } from '../../config/hall'

/** Shared by every part of the hall, and by both modes. */
export const HALL_MATERIALS = {
  // Lambert for the large surfaces that don't need to look metallic, as it costs far less to draw.
  wall: new MeshLambertMaterial({ color: '#0E1524' }),
  wallPanel: new MeshStandardMaterial({ color: HALL_COLORS.metal, metalness: 0.45, roughness: 0.55, envMapIntensity: 1 }),
  structure: new MeshStandardMaterial({ color: '#27344A', metalness: 0.8, roughness: 0.4, envMapIntensity: 0.8 }),
  ceiling: new MeshLambertMaterial({ color: '#0A101C' }),
  platform: new MeshStandardMaterial({ color: '#1E293B', metalness: 0.4, roughness: 0.65, envMapIntensity: 0.9 }),
  platformEdge: new MeshStandardMaterial({ color: '#141C2C', metalness: 0.85, roughness: 0.3, envMapIntensity: 0.9 }),
  platformInnerEdge: new MeshStandardMaterial({ color: '#1E293B', metalness: 0.4, roughness: 0.65, side: BackSide }),
  // Plain transparency: a transmission material would redraw the whole scene behind it.
  glass: new MeshStandardMaterial({
    color: '#A7C7D9',
    metalness: 0.9,
    roughness: 0.08,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  }),
  // These glow without any lights, so they cost almost nothing to draw.
  accent: new MeshBasicMaterial({ color: HALL_COLORS.accent, toneMapped: false }),
  secondaryAccent: new MeshBasicMaterial({ color: HALL_COLORS.secondaryAccent, toneMapped: false }),
  fixture: new MeshBasicMaterial({ color: HALL_COLORS.displayLight, toneMapped: false }),
  floorLine: new MeshBasicMaterial({ color: '#33475F', toneMapped: false }),
  floorLineAccent: new MeshBasicMaterial({ color: HALL_COLORS.accentDeep, toneMapped: false }),
}

/** A soft glow laid over a surface, for highlights that don't need a light. */
export function createGlowMaterial(map: MeshBasicMaterial['map']) {
  return new MeshBasicMaterial({
    map,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
}
