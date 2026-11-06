import { modeRegistry } from '../../features/modeRegistry'
import { useOperatingMode } from '../../hooks/useOperatingMode'
import { usePanels } from '../../hooks/usePanels'
import type { OperatingMode } from '../../types/mode'
import { UnderDevelopmentBadge } from '../common/UnderDevelopmentBadge'
import { PanelHeading, PanelText } from './PanelParts'

const MODES: OperatingMode[] = ['natural', 'artificial']

export function HomePanel() {
  const { activeMode, selectMode } = useOperatingMode()
  const { showPanel } = usePanels()

  return (
    <>
      <div>
        <p className="text-2xl font-semibold tracking-tight">Adaptable and Modular Drone</p>
        <p className="text-sm text-accent">Drone visualization and flight simulator</p>
      </div>
      <PanelText>
        See the drone in 3D, follow its orientation, and take the controls of a virtual copy.
        Nothing here flies the real drone.
      </PanelText>
      <div className="space-y-2">
        <PanelHeading>Current mode</PanelHeading>
        <p className="text-sm font-medium" data-home-mode>
          {modeRegistry[activeMode].metadata.title}
        </p>
      </div>
      <div className="space-y-2">
        <PanelHeading>Get started</PanelHeading>
        {MODES.map((mode) => {
          const { title, description, underDevelopment } = modeRegistry[mode].metadata
          return (
            <button
              key={mode}
              type="button"
              className="glass-button block w-full text-left"
              data-home-action={mode}
              onClick={() => {
                selectMode(mode)
                showPanel(mode)
              }}
            >
              <span className="flex items-center gap-2 font-semibold">
                {title}
                {underDevelopment && <UnderDevelopmentBadge />}
              </span>
              <span className="mt-0.5 block text-xs font-normal text-slate-300">{description}</span>
            </button>
          )
        })}
        <button
          type="button"
          className="glass-button w-full"
          data-home-action="help"
          onClick={() => showPanel('help')}
        >
          How to use the simulator
        </button>
      </div>
    </>
  )
}
