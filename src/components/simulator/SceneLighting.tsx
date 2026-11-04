import { Environment, Lightformer } from '@react-three/drei'

export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        intensity={2.5}
        position={[2, 4, 2]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.006}
        shadow-mapSize={[2048, 2048]}
        shadow-radius={8}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-camera-far={12}
      />
      {/* Metal and acrylic only look right with something to reflect. Built
          locally so that the scene doesn't download a lighting file at runtime. */}
      <Environment resolution={256}>
        <color attach="background" args={['#334155']} />
        <Lightformer intensity={1.5} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
        <Lightformer intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[2, 6, 1]} />
        <Lightformer intensity={2} position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[2, 6, 1]} />
      </Environment>
    </>
  )
}
