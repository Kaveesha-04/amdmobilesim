import { memo } from 'react'
import type { Vector3, Vector3Tuple } from 'three'
import { HALL_COLORS } from '../../config/hall'
import type { FlightArea as FlightAreaSize } from '../../config/world'
import { DisplayPlatform } from './DisplayPlatform'
import { FlightArea } from './FlightArea'
import { HallCeiling } from './HallCeiling'
import { HallFloor } from './HallFloor'
import { HallLighting } from './HallLighting'
import { HallPillars } from './HallPillars'
import { HallWalls } from './HallWalls'
import { InformationDisplays } from './InformationDisplays'

interface ExhibitionHallProps {
  /** Where the key light's shadows are centred. */
  focus: Vector3Tuple
  /** Moves the shadows along with this, for a drone that doesn't stay at `focus`. */
  movingFocus?: Vector3
  /** Shows this area's markings, and lays the stand flat so the drone can fly over it. */
  flightArea?: FlightAreaSize
}

/** The aerospace exhibition hall. It's built entirely in code, and doesn't change once drawn. */
export const ExhibitionHall = memo(function ExhibitionHall({
  focus,
  movingFocus,
  flightArea,
}: ExhibitionHallProps) {
  return (
    <>
      <color attach="background" args={[HALL_COLORS.environment]} />
      <HallLighting focus={focus} movingFocus={movingFocus} />
      <group name="ExhibitionHall">
        <HallFloor />
        <HallWalls />
        <HallCeiling />
        <HallPillars />
        <InformationDisplays />
        <DisplayPlatform raised={!flightArea} />
        {flightArea && <FlightArea area={flightArea} />}
      </group>
    </>
  )
})
