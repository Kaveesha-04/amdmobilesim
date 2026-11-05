import { useContext, useEffect } from 'react'
import { ModeRuntimeContext, ModeRuntimeSetterContext, type ModeRuntime } from '../stores/ModeRuntimeContext'

/** The active mode's live objects, or null while its view is still loading. */
export function useModeRuntime() {
  return useContext(ModeRuntimeContext)
}

/** Called by a mode's view, to offer its live objects for as long as it is on screen. */
export function useRegisterModeRuntime(runtime: ModeRuntime) {
  const setRuntime = useContext(ModeRuntimeSetterContext)

  useEffect(() => {
    setRuntime?.(() => runtime)
    return () => setRuntime?.((current) => (current === runtime ? null : current))
  }, [runtime, setRuntime])
}
