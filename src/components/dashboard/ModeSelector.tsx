import { availableModes } from '../../features/modeRegistry'
import { useOperatingMode } from '../../hooks/useOperatingMode'
import { ModeCard } from './ModeCard'

export function ModeSelector() {
  const { activeMode, selectMode } = useOperatingMode()

  return (
    <section aria-label="Operating mode" className="grid gap-4 sm:grid-cols-2">
      {availableModes.map((metadata) => (
        <ModeCard
          key={metadata.id}
          metadata={metadata}
          isSelected={activeMode === metadata.id}
          onSelect={() => selectMode(metadata.id)}
        />
      ))}
    </section>
  )
}
