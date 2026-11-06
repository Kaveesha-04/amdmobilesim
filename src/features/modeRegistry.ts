import { lazy, type ComponentType } from 'react'
import type { ModeMetadata, OperatingMode } from '../types/mode'
import { artificialModeMetadata } from './artificial-mode/metadata'
import { naturalModeMetadata } from './natural-mode/metadata'

interface ModeDefinition {
  metadata: ModeMetadata
  View: ComponentType
}

/**
 * The only module that knows about both modes. The features never import each
 * other, and each view is loaded on demand when its mode is first selected.
 */
export const modeRegistry: Record<OperatingMode, ModeDefinition> = {
  natural: {
    metadata: naturalModeMetadata,
    View: lazy(() => import('./natural-mode/NaturalModeView')),
  },
  artificial: {
    metadata: artificialModeMetadata,
    View: lazy(() => import('./artificial-mode/ArtificialModeView')),
  },
}

export const availableModes = Object.values(modeRegistry).map(({ metadata }) => metadata)
