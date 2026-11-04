import { useCallback, useSyncExternalStore } from 'react'

function subscribe(listener: () => void) {
  document.addEventListener('fullscreenchange', listener)
  return () => document.removeEventListener('fullscreenchange', listener)
}

const getIsFullscreen = () => document.fullscreenElement !== null

interface KeyboardLock {
  lock?: (keys: string[]) => Promise<void>
  unlock?: () => void
}

/**
 * Browsers normally take Esc to leave fullscreen, so a page never hears it. Where
 * supported, this keeps a short press for closing panels, and holding Esc still exits.
 */
const keyboardLock = () => (navigator as unknown as { keyboard?: KeyboardLock }).keyboard

/** Browsers allow this only after a click or key press, so it can't be started automatically. */
export function useFullscreen() {
  const isFullscreen = useSyncExternalStore(subscribe, getIsFullscreen)

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        keyboardLock()?.unlock?.()
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
        await keyboardLock()?.lock?.(['Escape'])
      }
    } catch (error) {
      console.warn('Fullscreen change was refused:', error)
    }
  }, [])

  return { isSupported: document.fullscreenEnabled, isFullscreen, toggleFullscreen }
}
