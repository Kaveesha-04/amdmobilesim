import { useSyncExternalStore } from 'react'
import { getDisplayPreferences, subscribeToDisplayPreferences } from '../stores/displayPreferences'

export function useDisplayPreferences() {
  return useSyncExternalStore(subscribeToDisplayPreferences, getDisplayPreferences)
}
