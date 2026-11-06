import { useMemo, useState, type ReactNode } from 'react'
import { PanelContext, type PanelId } from './PanelContext'

export function PanelProvider({ children }: { children: ReactNode }) {
  // Starts closed, so that the controls are ready to use as soon as the page opens.
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null)

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
