import { modeRegistry } from '../../features/modeRegistry'
import { useOperatingMode } from '../../hooks/useOperatingMode'

export function StatusIndicator() {
  const { activeMode } = useOperatingMode()
  const metadata = activeMode && modeRegistry[activeMode].metadata

  return (
    <div
      className="flex items-center gap-2.5 rounded-full border border-slate-800 bg-slate-950 px-3 py-1.5 text-sm"
      data-mode={activeMode ?? undefined}
      role="status"
    >
      <span
        aria-hidden="true"
        className={`size-2.5 rounded-full ${metadata ? 'bg-(--mode-accent)' : 'bg-slate-600'}`}
      />
      <span className="font-medium">{metadata?.title ?? 'Standby'}</span>
      <span className="text-slate-400">{metadata?.statusMessage ?? 'No mode selected'}</span>
    </div>
  )
}
