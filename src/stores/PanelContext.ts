import { createContext } from 'react'

export type PanelId = 'home' | 'natural' | 'artificial' | 'telemetry' | 'settings' | 'help'

export interface PanelContextValue {
  /** Only one panel is ever open. */
  openPanel: PanelId | null
  showPanel: (panel: PanelId) => void
  /** Opens the panel, or closes it if it's already open. */
  togglePanel: (panel: PanelId) => void
  closePanel: () => void
}

export const PanelContext = createContext<PanelContextValue | null>(null)
