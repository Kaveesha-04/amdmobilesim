import { KeyList, PanelHeading, PanelText } from './PanelParts'

const STICKS = [
  ['Left, up / down', 'Climb / descend'],
  ['Left, sideways', 'Turn left / right'],
  ['Right, up / down', 'Fly forward / back'],
  ['Right, sideways', 'Fly left / right'],
]

const KEYS = [
  ['W / S', 'Fly forward / back'],
  ['A / D', 'Fly left / right'],
  ['Q / E', 'Turn left / right'],
  ['↑ / ↓', 'Climb / descend'],
  ['Enter', 'Start motors'],
  ['Space', 'Stop motors'],
  ['R', 'Reset'],
  ['C', 'Switch camera'],
]

export function HelpPanel() {
  return (
    <>
      <section className="space-y-2" data-help="flying">
        <PanelHeading>Your first flight</PanelHeading>
        <PanelText>
          Tap Start, then hold the left stick up to raise the throttle until the drone lifts off.
          Let go and the throttle stays where it is. The drone hovers at about half throttle, marked
          by the line on the bar beside the stick. Lower the throttle to land.
        </PanelText>
        <PanelText>Stop turns the motors off at once, and in the air the drone falls.</PanelText>
        <KeyList keys={STICKS} />
      </section>
      <section className="space-y-2" data-help="keyboard">
        <PanelHeading>With a keyboard</PanelHeading>
        <KeyList keys={KEYS} />
      </section>
      <section className="space-y-2" data-help="zoom">
        <PanelHeading>Looking around</PanelHeading>
        <PanelText>
          Use + and − to move closer or further away, and tap the percentage to reset. In Free view,
          drag the scene to look around.
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
