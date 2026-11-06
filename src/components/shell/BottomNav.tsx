import type { ReactNode } from 'react'
import { modeRegistry } from '../../features/modeRegistry'
import { useOperatingMode } from '../../hooks/useOperatingMode'
import { usePanels } from '../../hooks/usePanels'
import type { PanelId } from '../../stores/PanelContext'
import { UnderDevelopmentBadge } from '../common/UnderDevelopmentBadge'
import { ArtificialIcon, HelpIcon, HomeIcon, NaturalIcon, SettingsIcon, TelemetryIcon } from './Icons'

const ITEMS: { id: PanelId; label: string; icon: ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'natural', label: 'Natural Mode', icon: <NaturalIcon /> },
  { id: 'artificial', label: 'Artificial Mode', icon: <ArtificialIcon /> },
  { id: 'telemetry', label: 'Telemetry', icon: <TelemetryIcon /> },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  { id: 'help', label: 'Help', icon: <HelpIcon /> },
]

export function BottomNav() {
  const { activeMode, selectMode } = useOperatingMode()
  const { openPanel, showPanel, togglePanel } = usePanels()

  const handleClick = (id: PanelId) => {
    if ((id === 'natural' || id === 'artificial') && id !== activeMode) {
      selectMode(id)
      showPanel(id)
    } else {
      togglePanel(id)
    }
  }

  return (
    <nav
      aria-label="Simulator"
      className="glass absolute bottom-4 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 gap-1 overflow-x-auto rounded-2xl p-1.5"
      data-shell-ui
    >
      {ITEMS.map(({ id, label, icon }) => {
        const isOpen = openPanel === id
        const isActiveMode = id === activeMode

        return (
          <button
            key={id}
            type="button"
            aria-pressed={isOpen}
            data-nav={id}
            className={`relative flex min-w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition duration-150 active:scale-95 ${
              isOpen ? 'bg-accent/20 text-accent' : 'text-slate-300 hover:bg-white/10 hover:text-slate-50'
            }`}
            onClick={() => handleClick(id)}
          >
            {icon}
            {label}
            {id === 'natural' && modeRegistry.natural.metadata.underDevelopment && (
              <UnderDevelopmentBadge />
            )}
            {isActiveMode && (
              <span
                aria-label="Current mode"
                className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent"
                data-nav-active-mode
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
