import { useEffect, useState, type ComponentType } from 'react'
import { usePanels } from '../../hooks/usePanels'
import type { PanelId } from '../../stores/PanelContext'
import { ArtificialModePanel } from '../panels/ArtificialModePanel'
import { HelpPanel } from '../panels/HelpPanel'
import { HomePanel } from '../panels/HomePanel'
import { NaturalModePanel } from '../panels/NaturalModePanel'
import { SettingsPanel } from '../panels/SettingsPanel'
import { TelemetryOverviewPanel } from '../panels/TelemetryOverviewPanel'
import { FloatingPanel } from './FloatingPanel'

const PANELS: Record<PanelId, { title: string; Content: ComponentType }> = {
  home: { title: 'Home', Content: HomePanel },
  natural: { title: 'Natural Mode', Content: NaturalModePanel },
  artificial: { title: 'Artificial Mode', Content: ArtificialModePanel },
  telemetry: { title: 'Telemetry', Content: TelemetryOverviewPanel },
  settings: { title: 'Settings', Content: SettingsPanel },
  help: { title: 'Help', Content: HelpPanel },
}

/** Matches the length of the exit animation in index.css. */
const EXIT_MS = 170
/** A press that moves further than this is a camera drag rather than a click. */
const CLICK_SLOP_PIXELS = 6

export function PanelLayer() {
  const { openPanel, closePanel } = usePanels()

  // Stays set for a moment after closing, so that the panel can animate out.
  const [shownPanel, setShownPanel] = useState(openPanel)
  if (openPanel && openPanel !== shownPanel) setShownPanel(openPanel)
  const isClosing = !openPanel && shownPanel !== null

  useEffect(() => {
    if (!isClosing) return
    const timer = setTimeout(() => setShownPanel(null), EXIT_MS)
    return () => clearTimeout(timer)
  }, [isClosing])

  useEffect(() => {
    if (!openPanel) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel()
    }

    // There's no backdrop, because it would block camera dragging. Instead, only a
    // press and release in one place on the scene counts as clicking outside.
    let press: { x: number; y: number } | null = null
    const isOnInterface = (target: EventTarget | null) =>
      target instanceof Element && target.closest('[data-shell-ui]') !== null

    const handlePointerDown = (event: PointerEvent) => {
      press = isOnInterface(event.target) ? null : { x: event.clientX, y: event.clientY }
    }
    const handlePointerUp = (event: PointerEvent) => {
      if (
        press &&
        Math.hypot(event.clientX - press.x, event.clientY - press.y) <= CLICK_SLOP_PIXELS
      ) {
        closePanel()
      }
      press = null
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('pointerup', handlePointerUp, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('pointerup', handlePointerUp, true)
    }
  }, [openPanel, closePanel])

  if (!shownPanel) return null

  const { title, Content } = PANELS[shownPanel]

  return (
    <FloatingPanel key={shownPanel} title={title} isClosing={isClosing} onClose={closePanel}>
      <Content />
    </FloatingPanel>
  )
}
