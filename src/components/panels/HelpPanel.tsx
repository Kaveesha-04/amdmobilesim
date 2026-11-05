import { useSyncExternalStore } from 'react'
import { COMMAND_KEYS, FLIGHT_KEYS } from '../../features/artificial-mode/controlsGuide'
import { useModeRuntime } from '../../hooks/useModeRuntime'
import type { ArtificialRuntime } from '../../stores/ModeRuntimeContext'
import { KeyList, PanelHeading, PanelText, PreparingMode } from './PanelParts'

function ArtificialHelp({ runtime }: { runtime: ArtificialRuntime }) {
  const { inputs } = runtime
  const kind = useSyncExternalStore(inputs.subscribeToKind, inputs.getKind)

  return kind === 'keyboard' ? (
    <section className="space-y-2" data-help="keyboard">
      <PanelHeading>Fly with the keyboard</PanelHeading>
      <PanelText>
        Press Enter to arm, then hold ↑ to take off. The drone hovers at about half throttle. Lower
        the throttle to land.
      </PanelText>
      <KeyList keys={[...FLIGHT_KEYS, ...COMMAND_KEYS]} />
    </section>
  ) : (
    <section className="space-y-2" data-help="transmitter">
      <PanelHeading>Fly with the transmitter</PanelHeading>
      <PanelText>
        Lower the throttle stick, press Enter to arm, then raise the throttle to take off. If the
        signal drops, the virtual motors stop and the drone has to be armed again.
      </PanelText>
      <KeyList keys={COMMAND_KEYS} />
    </section>
  )
}

export function HelpPanel() {
  const runtime = useModeRuntime()

  return (
    <>
      {!runtime && <PreparingMode />}
      {runtime?.mode === 'natural' && (
        <section className="space-y-2" data-help="natural">
          <PanelHeading>Natural Mode</PanelHeading>
          <PanelText>
            The model follows the real drone's orientation and stays in place. Drag the scene to
            look around, and scroll to zoom. Choose Artificial Mode to fly a virtual drone.
          </PanelText>
        </section>
      )}
      {runtime?.mode === 'artificial' && <ArtificialHelp runtime={runtime} />}
      <section className="space-y-2">
        <PanelHeading>Using the menu</PanelHeading>
        <PanelText>
          Choose an item at the bottom of the screen to open its panel. Choose it again, press Esc
          or click the scene to close it. The simulation keeps running behind panels.
        </PanelText>
      </section>
      <section className="space-y-2" data-help="zoom">
        <PanelHeading>Looking closer</PanelHeading>
        <PanelText>
          Use the zoom bar above the menu, or scroll over the scene, to move closer to the drone or
          further away.
        </PanelText>
      </section>
      <section className="space-y-2" data-help="safety">
        <PanelHeading>Safety</PanelHeading>
        <PanelText>
          This is a simulator. It never sends commands to the real drone or its motors.
        </PanelText>
      </section>
    </>
  )
}
