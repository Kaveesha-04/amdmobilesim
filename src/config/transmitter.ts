import type { TransmitterCalibration } from '../types/transmitter'

export const TRANSMITTER_CONFIG = {
  /** Where the Signal Receiver runs. */
  receiverUrl: (import.meta.env.VITE_SIGNAL_RECEIVER_URL as string | undefined) ?? 'http://localhost:3000',
  /** The wait between one answer and the next request, so that requests can't overlap. */
  pollIntervalMs: 50,
  /** A request taking longer than this counts as a lost connection. */
  requestTimeoutMs: 1000,
  /**
   * With no new message from the ESP32 for this long, the signal counts as lost.
   * The ESP32 was measured sending about every 206 ms, with a worst gap of 617 ms.
   */
  staleAfterMs: 1000,
  /** A value further than this share of its range beyond min or max is invalid, not just imprecise. */
  outOfRangeMargin: 0.1,
}

/**
 * The team's shared transmitter, measured on 2026-11-05 and in raw transmitter units.
 * Every laptop uses these same values. Once normalized, positive roll is right,
 * positive pitch is forward and positive yaw is nose right. The ESP32 sends roll and
 * pitch with the opposite signs, so those two are inverted here and nowhere else.
 */
export const TRANSMITTER_CALIBRATION: TransmitterCalibration = {
  throttle: { min: 1000, max: 2000, deadband: 2, invert: false },
  roll: { min: -500, max: 500, center: 0, deadband: 5, invert: true },
  pitch: { min: -500, max: 500, center: 0, deadband: 5, invert: true },
  yaw: { min: -500, max: 500, center: 0, deadband: 5, invert: false },
}
