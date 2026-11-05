import { TRANSMITTER_CONFIG } from '../../config/transmitter'
import type { FlightControls } from '../../types/flight'
import type {
  ChannelCalibration,
  RawTransmitterData,
  TransmitterCalibration,
  TransmitterChannel,
} from '../../types/transmitter'

const CHANNELS: TransmitterChannel[] = ['throttle', 'roll', 'pitch', 'yaw']

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function isOutOfRange(value: number, { min, max }: ChannelCalibration) {
  const margin = (max - min) * TRANSMITTER_CONFIG.outOfRangeMargin
  return value < min - margin || value > max + margin
}

/**
 * Converts to 0 to 1. The deadband sits at the bottom, and the range above it is
 * rescaled, so that the output starts from zero rather than jumping to it.
 */
export function normalizeThrottle(value: number, { min, max, deadband, invert }: ChannelCalibration) {
  const raised = (invert ? max - value : value - min) - deadband
  return clamp(raised / (max - min - deadband), 0, 1)
}

/**
 * Converts to -1 to +1 about the stick's resting value. Each side is scaled by its
 * own travel, as a stick's centre often isn't halfway between its limits.
 */
export function normalizeStick(value: number, calibration: ChannelCalibration) {
  const { min, max, center = (min + max) / 2, deadband, invert } = calibration
  const offset = value - center
  if (Math.abs(offset) <= deadband) return 0

  const travel = offset > 0 ? max - center : center - min
  const output = clamp((offset - Math.sign(offset) * deadband) / (travel - deadband), -1, 1)
  return invert ? -output : output
}

export type NormalizeResult =
  | { valid: true; controls: FlightControls }
  | { valid: false; reason: string }

export function normalizeControls(
  raw: RawTransmitterData,
  calibration: TransmitterCalibration,
): NormalizeResult {
  for (const channel of CHANNELS) {
    if (isOutOfRange(raw[channel], calibration[channel])) {
      const { min, max } = calibration[channel]
      return { valid: false, reason: `${channel} of ${raw[channel]} is outside ${min} to ${max}` }
    }
  }

  return {
    valid: true,
    controls: {
      throttle: normalizeThrottle(raw.throttle, calibration.throttle),
      roll: normalizeStick(raw.roll, calibration.roll),
      pitch: normalizeStick(raw.pitch, calibration.pitch),
      yaw: normalizeStick(raw.yaw, calibration.yaw),
    },
  }
}

export type ParseResult =
  | { calibration: TransmitterCalibration; error: null }
  | { calibration: null; error: string }

const fail = (error: string): ParseResult => ({ calibration: null, error })

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** Reads calibration from its JSON form. Anything doubtful is refused rather than patched up. */
export function parseCalibration(json: string | undefined): ParseResult {
  if (!json?.trim()) return fail('Calibration is not set')

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return fail('Calibration is not valid JSON')
  }
  if (typeof parsed !== 'object' || parsed === null) return fail('Calibration is not an object')

  for (const channel of CHANNELS) {
    const entry = (parsed as Record<string, Partial<ChannelCalibration> | undefined>)[channel]
    const needsCenter = channel !== 'throttle'

    if (!entry) return fail(`Calibration has no ${channel} channel`)
    const { min, max, center, deadband, invert } = entry
    if (!isNumber(min) || !isNumber(max) || min >= max) {
      return fail(`Calibration for ${channel} needs a min below its max`)
    }
    if (!isNumber(deadband) || deadband < 0) {
      return fail(`Calibration for ${channel} needs a deadband of zero or more`)
    }
    if (typeof invert !== 'boolean') return fail(`Calibration for ${channel} needs invert as true or false`)

    if (needsCenter) {
      if (!isNumber(center) || center <= min || center >= max) {
        return fail(`Calibration for ${channel} needs a center between its min and max`)
      }
      if (deadband >= Math.min(max - center, center - min)) {
        return fail(`The deadband for ${channel} covers its whole travel`)
      }
    } else if (deadband >= max - min) {
      return fail(`The deadband for ${channel} covers its whole travel`)
    }
  }

  return { calibration: parsed as TransmitterCalibration, error: null }
}
