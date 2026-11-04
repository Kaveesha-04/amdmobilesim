import { useContext } from 'react'
import { PanelContext } from '../stores/PanelContext'

export function usePanels() {
  const context = useContext(PanelContext)

  if (!context) {
    throw new Error('usePanels must be used inside a PanelProvider')
  }

  return context
}
