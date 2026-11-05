export const TRANSMITTER_CONFIG = {
  /** Where the Signal Receiver runs. */
  receiverUrl: (import.meta.env.VITE_SIGNAL_RECEIVER_URL as string | undefined) ?? 'http://localhost:3000',
  /** The wait between one answer and the next request, so that requests can't overlap. */
  pollIntervalMs: 50,
  /** A request taking longer than this counts as a lost connection. */
  requestTimeoutMs: 1000,
  /**
   * With no new message from the ESP32 for this long, the signal counts as lost.
   * The ESP32's real sending rate hasn't been measured, so check this against it.
   */
  staleAfterMs: 1000,
  /** A value further than this share of its range beyond min or max is invalid, not just imprecise. */
  outOfRangeMargin: 0.1,
}

/**
 * The calibration, as JSON, from the environment. See .env.example. There's
 * deliberately no default: the real transmitter's ranges haven't been measured,
 * and flying on a guess could send the virtual drone off at full stick.
 */
export const TRANSMITTER_CALIBRATION_JSON = import.meta.env.VITE_TRANSMITTER_CALIBRATION as
  | string
  | undefined
