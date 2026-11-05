import { useMemo } from 'react'
import { BoxGeometry, EdgesGeometry } from 'three'
import { GROUND_HEIGHT, type FlightArea } from '../../config/world'

const BOUNDARY_COLOR = '#fbbf24'
const POST_HEIGHT = 1.5
const POST_RADIUS = 0.06

/** A visual marker only: it doesn't stop anything from crossing it. */
export function FlightBoundary({ area, color = BOUNDARY_COLOR }: { area: FlightArea; color?: string }) {
  const { width, depth, height } = area

  const edges = useMemo(
    () => new EdgesGeometry(new BoxGeometry(width, height, depth)),
    [width, height, depth],
  )

  const corners = [
    [-width / 2, -depth / 2],
    [width / 2, -depth / 2],
    [-width / 2, depth / 2],
    [width / 2, depth / 2],
  ]

  return (
    <group name="FlightBoundary" position={[0, GROUND_HEIGHT, 0]}>
      <lineSegments name="FlightBoundaryEdges" geometry={edges} position={[0, height / 2, 0]}>
        <lineBasicMaterial color={color} transparent opacity={0.45} />
      </lineSegments>
      {corners.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, POST_HEIGHT / 2, z]}>
          <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, POST_HEIGHT, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}
