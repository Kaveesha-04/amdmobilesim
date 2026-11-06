import { TELEMETRY_CONFIG } from '../../config/telemetry'
import type { Attitude, TelemetrySample } from '../../types/telemetry'
import { normalizeDegrees } from '../../utils/orientation'

export type ValidationResult =
  | { valid: true; sample: TelemetrySample }
  | { valid: false; reason: string }

const ANGLES: (keyof Attitude)[] = ['roll', 'pitch', 'yaw']

/** Accepts only real numbers of the expected size. Numeric strings are for an adapter to convert. */
export function validateTelemetry(raw: unknown): ValidationResult {
  if (typeof raw !== 'object' || raw === null) {
    return { valid: false, reason: 'The reading is not an object' }
  }

  const fields = raw as Record<string, unknown>

  for (const angle of ANGLES) {
    const value = fields[angle]
    if (value === undefined) return { valid: false, reason: `${angle} is missing` }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { valid: false, reason: `${angle} is not a finite number` }
    }
    const limit = TELEMETRY_CONFIG.limits[angle]
    if (Math.abs(value) > limit) {
      return { valid: false, reason: `${angle} of ${value}° is outside ±${limit}°` }
    }
  }

  const { timestamp } = fields
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp < 0) {
    return { valid: false, reason: 'timestamp is missing or not a valid number' }
  }

  return {
    valid: true,
    sample: {
      roll: fields.roll as number,
      pitch: fields.pitch as number,
      yaw: normalizeDegrees(fields.yaw as number),
      timestamp,
    },
  }
}
