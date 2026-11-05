import { useMemo, useState, type ReactNode } from 'react'
import type { OperatingMode } from '../types/mode'
import { ModeContext } from './ModeContext'

export function ModeProvider({ children }: { children: ReactNode }) {
  // Natural Mode comes first because it leaves the keyboard alone until a visitor chooses to fly.
  const [activeMode, setActiveMode] = useState<OperatingMode>('natural')

  const value = useMemo(() => ({ activeMode, selectMode: setActiveMode }), [activeMode])

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}
