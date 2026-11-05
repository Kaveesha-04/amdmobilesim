import { useEffect } from 'react'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import { ModeRuntimeProvider } from '../../stores/ModeRuntimeProvider'
import { PanelProvider } from '../../stores/PanelProvider'
import { ActiveModeScene } from './ActiveModeScene'
import { BottomNav } from './BottomNav'
import { PanelLayer } from './PanelLayer'
import { TopStatusBar } from './TopStatusBar'

function GlassPreference() {
  const { reduceGlass } = useDisplayPreferences()

  useEffect(() => {
    document.documentElement.toggleAttribute('data-reduce-glass', reduceGlass)
  }, [reduceGlass])

  return null
}

/**
 * The full-screen interface. The scene and the interface are siblings, and panel
 * state lives in a provider above them that only the interface reads, so nothing
 * the visitor does here re-renders or rebuilds the 3D scene.
 */
export function SimulatorShell() {
  return (
    <ModeRuntimeProvider>
      <PanelProvider>
        <GlassPreference />
        <div className="relative h-full w-full overflow-hidden">
          <ActiveModeScene />
          <TopStatusBar />
          <PanelLayer />
          <BottomNav />
        </div>
      </PanelProvider>
    </ModeRuntimeProvider>
  )
}
