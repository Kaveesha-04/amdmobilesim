import { Grid } from '@react-three/drei'

const GROUND_SIZE = 40

export function GroundPlane() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color="#1e293b" envMapIntensity={0.3} />
      </mesh>
      {/* Lifted slightly to avoid z-fighting with the plane. */}
      <Grid
        args={[GROUND_SIZE, GROUND_SIZE]}
        position={[0, 0.005, 0]}
        cellColor="#475569"
        sectionColor="#64748b"
        cellSize={0.1}
        sectionSize={1}
        fadeDistance={8}
      />
    </group>
  )
}
