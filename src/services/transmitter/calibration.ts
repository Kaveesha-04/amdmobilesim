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
