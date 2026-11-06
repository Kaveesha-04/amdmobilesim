import { useState, type ReactNode } from 'react'
import { ModeRuntimeContext, ModeRuntimeSetterContext, type ModeRuntime } from './ModeRuntimeContext'

export function ModeRuntimeProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState<ModeRuntime | null>(null)

  return (
    <ModeRuntimeSetterContext.Provider value={setRuntime}>
      <ModeRuntimeContext.Provider value={runtime}>{children}</ModeRuntimeContext.Provider>
    </ModeRuntimeSetterContext.Provider>
  )
}
