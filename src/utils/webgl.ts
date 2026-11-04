export function isWebGLAvailable(): boolean {
  const context = document.createElement('canvas').getContext('webgl2')
  // Browsers cap live WebGL contexts, so release the probe straight away.
  context?.getExtension('WEBGL_lose_context')?.loseContext()
  return context !== null
}
