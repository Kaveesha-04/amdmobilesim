import { Suspense } from 'react'
import { modeRegistry } from '../../features/modeRegistry'
import { useOperatingMode } from '../../hooks/useOperatingMode'
import { ErrorBoundary } from '../common/ErrorBoundary'

function LoadingMode() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400" role="status">
      Preparing the selected mode…
    </div>
  )
}

/**
 * The 3D scene behind the whole interface. It depends only on the operating mode, so
 * panels opening and closing can't re-render it, and each mode's work carries on.
 */
export function ActiveModeScene() {
  const { activeMode } = useOperatingMode()
  const { View } = modeRegistry[activeMode]

  return (
    <main className="absolute inset-0">
      {/* Keyed so that an error in one mode doesn't stick after switching to the other. */}
      <ErrorBoundary key={activeMode}>
        <Suspense fallback={<LoadingMode />}>
          <View />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}
