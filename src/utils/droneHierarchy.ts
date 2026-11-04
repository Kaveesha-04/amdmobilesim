import type { Object3D } from 'three'

const DRONE_PART_PATTERNS = {
  root: /^MoonLady_Beta_1_Root$/,
  chassis: /^Chassis_Enclosure$/,
  arms: /^Arm_/,
  motors: /^Motor_(FL|FR|RL|RR)_(Base|Bell)$/,
  propellers: /^Propeller_(FL|FR|RL|RR)$/,
  landingGear: /^Landing_Gear_/,
}

function describeHierarchy(object: Object3D, depth = 0): string {
  const line = `${'  '.repeat(depth)}${object.name || '(unnamed)'} [${object.type}]`
  return [line, ...object.children.map((child) => describeHierarchy(child, depth + 1))].join('\n')
}

let hasLogged = false

/** Logs once per page load, because the model remounts on every mode switch. */
export function logDroneHierarchy(scene: Object3D) {
  if (hasLogged) return
  hasLogged = true

  const names: string[] = []
  scene.traverse((object) => names.push(object.name))

  const parts = Object.fromEntries(
    Object.entries(DRONE_PART_PATTERNS).map(([part, pattern]) => [
      part,
      names.filter((name) => pattern.test(name)),
    ]),
  )

  console.groupCollapsed('MoonLady Beta 1 model hierarchy')
  console.log(describeHierarchy(scene))
  console.log('Identified parts:', parts)
  console.groupEnd()
}
