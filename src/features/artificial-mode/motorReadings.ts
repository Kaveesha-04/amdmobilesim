import { VIRTUAL_MOTOR_MAX_RPM } from '../../config/flight'

const clampOutput = (output: number) => Math.min(Math.max(output, 0), 1)

/** What one virtual motor's output comes to. Only ever worked out from that output. */
export function readMotor(output: number) {
  const clamped = clampOutput(output)
  return {
    output: clamped,
    percent: Math.round(clamped * 100),
    rpm: Math.round(clamped * VIRTUAL_MOTOR_MAX_RPM),
    isRunning: clamped > 0,
  }
}

export function summarizeMotors(outputs: number[]) {
  const motors = outputs.map(readMotor)
  const total = motors.reduce((sum, motor) => sum + motor.output, 0)
  const rpms = motors.map((motor) => motor.rpm)

  return {
    averagePercent: Math.round((total / motors.length) * 100),
    highestRpm: Math.max(...rpms),
    lowestRpm: Math.min(...rpms),
    activeCount: motors.filter((motor) => motor.isRunning).length,
  }
}
