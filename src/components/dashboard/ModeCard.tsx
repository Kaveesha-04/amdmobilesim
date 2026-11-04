import type { ModeMetadata } from '../../types/mode'

interface ModeCardProps {
  metadata: ModeMetadata
  isSelected: boolean
  onSelect: () => void
}

export function ModeCard({ metadata, isSelected, onSelect }: ModeCardProps) {
  const selectionClasses = isSelected
    ? 'border-(--mode-accent) bg-slate-900 ring-1 ring-(--mode-accent)'
    : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      className={`flex w-full cursor-pointer flex-col rounded-lg border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-100 ${selectionClasses}`}
      data-mode={metadata.id}
      onClick={onSelect}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="text-lg font-semibold">{metadata.title}</span>
        {isSelected && (
          <span className="rounded-full bg-(--mode-accent) px-2.5 py-0.5 text-xs font-semibold text-slate-950">
            Selected
          </span>
        )}
      </span>
      <span className="mt-2 text-sm text-slate-400">{metadata.description}</span>
      <span className="mt-4 text-xs text-slate-500">Input: {metadata.inputSource}</span>
    </button>
  )
}
