import { useMemo, useState, type ReactNode } from 'react'
import { PanelContext, type PanelId } from './PanelContext'

export function PanelProvider({ children }: { children: ReactNode }) {
  // Starts open, so that a first-time visitor sees what this is and what to do.
  const [openPanel, setOpenPanel] = useState<PanelId | null>('home')

  const value = useMemo(
    () => ({
      openPanel,
      showPanel: setOpenPanel,
      togglePanel: (panel: PanelId) => setOpenPanel((current) => (current === panel ? null : panel)),
      closePanel: () => setOpenPanel(null),
    }),
    [openPanel],
  )

  return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
}
