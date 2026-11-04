import { Suspense } from 'react'
import { modeRegistry } from '../../features/modeRegistry'
import { useOperatingMode } from '../../hooks/useOperatingMode'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { Notice } from '../common/Notice'

export function ActiveModeContent() {
  const { activeMode } = useOperatingMode()

  if (!activeMode) {
    return <Notice title="No mode selected">Choose Natural Mode or Artificial Mode to begin.</Notice>
  }

  const { View } = modeRegistry[activeMode]

  return (
    // Keyed so that an error in one mode doesn't stick after switching to the other.
    <ErrorBoundary key={activeMode}>
      <Suspense fallback={<Notice title="Loading">Preparing the selected mode…</Notice>}>
        <View />
      </Suspense>
    </ErrorBoundary>
  )
}
