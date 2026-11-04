import type { ReactNode } from 'react'

interface NoticeProps {
  title: string
  children: ReactNode
  tone?: 'neutral' | 'error'
}

export function Notice({ title, children, tone = 'neutral' }: NoticeProps) {
  const toneClasses =
    tone === 'error' ? 'border-red-500/50 bg-red-950/40' : 'border-slate-800 bg-slate-900'

  return (
    <div className={`rounded-lg border px-4 py-3 ${toneClasses}`} role={tone === 'error' ? 'alert' : undefined}>
      <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{children}</p>
    </div>
  )
}
