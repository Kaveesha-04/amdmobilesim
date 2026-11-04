import { useMemo, useState, type ReactNode } from 'react'
import type { OperatingMode } from '../types/mode'
import { ModeContext } from './ModeContext'

export function ModeProvider({ children }: { children: ReactNode }) {
  const [activeMode, setActiveMode] = useState<OperatingMode | null>(null)

  const value = useMemo(() => ({ activeMode, selectMode: setActiveMode }), [activeMode])

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}
