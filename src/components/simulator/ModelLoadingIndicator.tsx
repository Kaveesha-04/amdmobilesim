import { useProgress } from '@react-three/drei'

/** An overlay for the canvas, so that its progress updates never re-render the 3D scene. */
export function ModelLoadingIndicator() {
  const { active, progress } = useProgress()

  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div
        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-300"
        role="status"
      >
        Loading drone model… {Math.round(progress)}%
      </div>
    </div>
  )
}
