import type { ReactNode } from 'react'
import { CloseIcon } from './Icons'

interface FloatingPanelProps {
  title: string
  isClosing: boolean
  onClose: () => void
  children: ReactNode
}

/** The frame every panel shares. It floats over the scene, which keeps running behind it. */
export function FloatingPanel({ title, isClosing, onClose, children }: FloatingPanelProps) {
  return (
    <aside
      aria-label={`${title} panel`}
      className={`glass absolute top-20 right-4 flex max-h-[calc(100%-12rem)] w-[min(24rem,calc(100%-2rem))] flex-col overflow-hidden rounded-2xl ${isClosing ? 'panel-exit' : 'panel-enter'}`}
      data-shell-ui
      data-panel
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <button
          type="button"
          aria-label={`Close ${title}`}
          className="cursor-pointer rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-50"
          data-panel-close
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">{children}</div>
    </aside>
  )
}
