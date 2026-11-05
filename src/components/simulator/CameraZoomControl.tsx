import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { CAMERA_ZOOM } from '../../config/camera'
import type { CameraZoom } from '../../stores/cameraZoom'
import { MinusIcon, PlusIcon, ResetIcon } from '../shell/Icons'

const SLIDER_STEPS = 1000
const ICON_BUTTON_CLASS =
  'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-200 transition duration-150 hover:bg-white/10 hover:text-accent active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-200 disabled:active:scale-100'

function ZoomButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={ICON_BUTTON_CLASS}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

/**
 * The floating zoom bar, above the bottom navigation. It's outside the canvas, so
 * dragging the slider can't reach the orbit controls, and data-shell-ui stops a
 * press on it counting as a click on the scene, which would close the open panel.
 */
export function CameraZoomControl({ zoom }: { zoom: CameraZoom }) {
  const distance = useSyncExternalStore(zoom.subscribe, zoom.getDistance)
  const { minDistance, maxDistance, defaultDistance } = zoom

  // The range is wide, so equal movements of the slider scale the distance by equal
  // amounts. Evenly spaced distances would leave almost no travel for the close views.
  const range = Math.log(maxDistance / minDistance)
  const position = Math.round((Math.log(maxDistance / distance) / range) * SLIDER_STEPS)
  const levelPercent = Math.round((defaultDistance / distance) * 100)

  const handleSlider = (value: number) => {
    zoom.setDistance(maxDistance * Math.exp((-value / SLIDER_STEPS) * range))
  }

  return (
    <div
      role="group"
      aria-label="Camera zoom"
      className="glass absolute bottom-24 left-1/2 flex w-[min(26rem,calc(100%-2rem))] -translate-x-1/2 items-center gap-1 rounded-2xl p-1.5"
      data-shell-ui
      data-zoom-control
    >
      <ZoomButton
        label="Zoom out"
        disabled={distance >= maxDistance}
        onClick={() => zoom.zoomBy(CAMERA_ZOOM.buttonFactor)}
      >
        <MinusIcon />
      </ZoomButton>

      <input
        type="range"
        aria-label="Zoom level"
        aria-valuetext={`${levelPercent}%`}
        className="zoom-slider mx-1 min-w-0 flex-1"
        style={{ '--zoom-fill': `${position / (SLIDER_STEPS / 100)}%` } as CSSProperties}
        min={0}
        max={SLIDER_STEPS}
        value={position}
        onChange={(event) => handleSlider(event.currentTarget.valueAsNumber)}
        // While it has focus the flight keys are ignored, and Enter wouldn't arm the
        // drone. Keyboard users can still tab to it and use the arrow keys.
        onPointerUp={(event) => event.currentTarget.blur()}
      />

      <ZoomButton
        label="Zoom in"
        disabled={distance <= minDistance}
        onClick={() => zoom.zoomBy(1 / CAMERA_ZOOM.buttonFactor)}
      >
        <PlusIcon />
      </ZoomButton>

      <output
        aria-live="off"
        className="w-12 shrink-0 text-center text-sm font-semibold text-accent tabular-nums"
        data-zoom-level
      >
        {levelPercent}%
      </output>

      <ZoomButton
        label="Reset zoom"
        disabled={levelPercent === 100}
        onClick={() => zoom.reset()}
      >
        <ResetIcon />
      </ZoomButton>
    </div>
  )
}
