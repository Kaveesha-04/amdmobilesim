import type { ReactNode } from 'react'

export function PanelText({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-300">{children}</p>
}

export function PanelHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-xs font-semibold tracking-wide text-slate-400 uppercase">{children}</h3>
}

export function KeyList({ keys }: { keys: string[][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
      {keys.map(([key, action]) => (
        <div key={key} className="contents">
          <dt className="font-mono text-slate-100">{key}</dt>
          <dd className="text-slate-300">{action}</dd>
        </div>
      ))}
    </dl>
  )
}

interface ChoiceProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  name: string
}

export function Choice<T extends string>({ label, value, options, onChange, name }: ChoiceProps<T>) {
  return (
    <div role="group" aria-label={label}>
      <p className="mb-1.5 text-sm text-slate-300">{label}</p>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            className="glass-button flex-1 aria-pressed:border-accent aria-pressed:text-accent"
            data-choice={`${name}-${option.value}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
