import type { Attitude } from '../types/telemetry'

/**
 * The drone's real sensor output hasn't been confirmed yet, so check these
 * against the actual hardware when it is connected.
 */
export const TELEMETRY_CONFIG = {
  /** With no message for this long, the data counts as stale. */
  staleAfterMs: 1000,
  /**
   * How quickly the model catches up with a new reading: it closes about 63% of
   * the gap in this time and 95% in three times this. Use 0 to turn smoothing off.
   */
  smoothingTimeConstantSeconds: 0.05,
  /**
   * The largest size accepted for each angle, in degrees. Anything beyond this is
   * rejected as invalid. Yaw allows for sensors reporting either 0 to 360 or ±180.
   */
  limits: { roll: 180, pitch: 180, yaw: 360 } satisfies Attitude,
  /**
   * Set an axis to -1 if the sensor's positive direction is the opposite of the
   * convention in utils/orientation.ts.
   */
  signs: { roll: 1, pitch: 1, yaw: 1 } satisfies Attitude,
}
