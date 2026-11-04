import type { ModeMetadata } from '../../types/mode'

export const artificialModeMetadata: ModeMetadata = {
  id: 'artificial',
  title: 'Artificial Mode',
  description:
    'Flies the virtual drone in a 3D environment. Never sends commands to the actual drone motors.',
  inputSource: 'ESP32 transmitter',
  statusMessage: 'Transmitter not connected',
}
