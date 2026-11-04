import { createContext } from 'react'
import type { OperatingMode } from '../types/mode'

export interface ModeContextValue {
  /** The selected operating mode, or null until the user picks one. */
  activeMode: OperatingMode | null
  selectMode: (mode: OperatingMode) => void
}

export const ModeContext = createContext<ModeContextValue | null>(null)
