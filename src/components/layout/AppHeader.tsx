import { StatusIndicator } from '../dashboard/StatusIndicator'

export function AppHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">MoonLady Beta 1</h1>
          <p className="text-sm text-slate-400">Drone visualization and simulation</p>
        </div>
        <StatusIndicator />
      </div>
    </header>
  )
}
