export type GraphicsQuality = 'high' | 'balanced' | 'performance'

export interface DisplayPreferences {
  graphicsQuality: GraphicsQuality
  reduceGlass: boolean
  showFlightReadout: boolean
}

const STORAGE_KEY = 'moonlady.displayPreferences'

const DEFAULTS: DisplayPreferences = {
  graphicsQuality: 'high',
  reduceGlass: false,
  showFlightReadout: true,
}

function load(): DisplayPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<DisplayPreferences>
    return {
      graphicsQuality: ['high', 'balanced', 'performance'].includes(saved.graphicsQuality as string)
        ? (saved.graphicsQuality as GraphicsQuality)
        : DEFAULTS.graphicsQuality,
      reduceGlass: saved.reduceGlass === true,
      showFlightReadout: saved.showFlightReadout !== false,
    }
  } catch {
    return DEFAULTS
  }
}

let preferences = load()
const listeners = new Set<() => void>()

export const getDisplayPreferences = () => preferences

export function subscribeToDisplayPreferences(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setDisplayPreferences(change: Partial<DisplayPreferences>) {
  preferences = { ...preferences, ...change }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
  } catch {
    // Storage can be unavailable. The preference then lasts until reload.
  }
  listeners.forEach((listener) => listener())
}
