import { useContext } from 'react'
import { ModeContext } from '../stores/ModeContext'

export function useOperatingMode() {
  const context = useContext(ModeContext)

  if (!context) {
    throw new Error('useOperatingMode must be used inside a ModeProvider')
  }

  return context
}
