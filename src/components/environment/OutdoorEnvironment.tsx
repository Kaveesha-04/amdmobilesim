import type { Vector3Tuple } from 'three'
import type { FlightArea } from '../../config/world'
import { FlightBoundary } from './FlightBoundary'
import { Ground } from './Ground'
import { Lighting } from './Lighting'
import { Sky } from './Sky'

const HAZE_COLOR = '#eef1f3'

interface OutdoorEnvironmentProps {
  /** Where the sun's shadows are centred. */
  focus: Vector3Tuple
  /** Shows this area's boundary. Leave it out for no boundary. */
  flightArea?: FlightArea
}

export function OutdoorEnvironment({ focus, flightArea }: OutdoorEnvironmentProps) {
  return (
    <>
      {/* Blends the far edge of the ground into the horizon. */}
      <fog attach="fog" args={[HAZE_COLOR, 40, 380]} />
      <Sky />
      <Lighting focus={focus} />
      <Ground />
      {flightArea && <FlightBoundary area={flightArea} />}
    </>
  )
}
