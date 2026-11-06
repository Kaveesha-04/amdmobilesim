export type GraphicsQuality = 'high' | 'balanced' | 'performance'

export interface DisplayPreferences {
  graphicsQuality: GraphicsQuality
  reduceGlass: boolean
  showMotorIndicators: boolean
}

const STORAGE_KEY = 'moonlady.displayPreferences'

/** A touch screen usually means a phone or tablet, which starts at a resolution it can keep up with. */
const defaultQuality = (): GraphicsQuality =>
  window.matchMedia('(pointer: coarse)').matches ? 'balanced' : 'high'

function load(): DisplayPreferences {
  const defaults: DisplayPreferences = {
    graphicsQuality: defaultQuality(),
    reduceGlass: false,
    showMotorIndicators: true,
  }

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<DisplayPreferences>
    return {
      graphicsQuality: ['high', 'balanced', 'performance'].includes(saved.graphicsQuality as string)
        ? (saved.graphicsQuality as GraphicsQuality)
        : defaults.graphicsQuality,
      reduceGlass: saved.reduceGlass === true,
      showMotorIndicators: saved.showMotorIndicators !== false,
    }
  } catch {
    return defaults
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
