import type { ReactNode } from 'react'

function Icon({ children, className = 'size-5' }: { children: ReactNode; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  )
}

export const SettingsIcon = () => (
  <Icon>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
)
export const HelpIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" />
  </Icon>
)
export const CloseIcon = () => (
  <Icon className="size-4">
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)
export const EnterFullscreenIcon = () => (
  <Icon className="size-4">
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icon>
)
export const ExitFullscreenIcon = () => (
  <Icon className="size-4">
    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
  </Icon>
)
export const MinusIcon = () => (
  <Icon className="size-4">
    <path d="M5 12h14" />
  </Icon>
)
export const PlusIcon = () => (
  <Icon className="size-4">
    <path d="M5 12h14M12 5v14" />
  </Icon>
)
