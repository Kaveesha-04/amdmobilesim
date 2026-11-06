/** What one virtual motor's output comes to. Only ever worked out from that output. */
export function readMotor(output: number) {
  const clamped = Math.min(Math.max(output, 0), 1)
  return {
    output: clamped,
    percent: Math.round(clamped * 100),
    isRunning: clamped > 0,
  }
}
