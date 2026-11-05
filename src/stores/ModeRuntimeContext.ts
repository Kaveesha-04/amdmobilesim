import { createContext } from 'react'
import type { InputController } from '../services/flightInput/InputController'
import type { MockTelemetryProvider } from '../services/telemetry/MockTelemetryProvider'
import type { FlightStore } from './flightStore'
import type { TelemetryStore } from './telemetryStore'

export interface NaturalRuntime {
  mode: 'natural'
  store: TelemetryStore
  sourceName: string | null
  isSimulated: boolean
  /** Set only in development. */
  mock: MockTelemetryProvider | null
}

export interface ArtificialRuntime {
  mode: 'artificial'
  store: FlightStore
  inputs: InputController
  configuredReceiverUrl: string
  calibrationError: string | null
  staleAfterMs: number
}

/** The live objects of whichever mode is on screen, so that panels outside its view can show them. */
export type ModeRuntime = NaturalRuntime | ArtificialRuntime

export const ModeRuntimeContext = createContext<ModeRuntime | null>(null)

/** Kept apart from the value, so that a registering view isn't re-rendered by what it registers. */
export const ModeRuntimeSetterContext = createContext<
  ((update: (current: ModeRuntime | null) => ModeRuntime | null) => void) | null
>(null)
