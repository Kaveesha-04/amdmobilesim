import { createContext } from 'react'
import type { OperatingMode } from '../types/mode'

export interface ModeContextValue {
  activeMode: OperatingMode
  selectMode: (mode: OperatingMode) => void
}

export const ModeContext = createContext<ModeContextValue | null>(null)
