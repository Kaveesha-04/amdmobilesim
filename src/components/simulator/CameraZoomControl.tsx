import { useSyncExternalStore, type ReactNode } from 'react'
import { CAMERA_ZOOM } from '../../config/camera'
import type { CameraZoom } from '../../stores/cameraZoom'
import { MinusIcon, PlusIcon } from '../shell/Icons'

const BUTTON_CLASS =
  'flex size-[42px] cursor-pointer items-center justify-center rounded-lg text-slate-200 transition duration-150 hover:bg-white/10 hover:text-accent active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-slate-200 disabled:active:scale-100'

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
      className={BUTTON_CLASS}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

/**
 * The zoom buttons, at the edge of the screen where they stay clear of the thumb sticks. data-shell-ui stops a press on them counting as a click on the
 * scene, which would close the open panel.
 */
export function CameraZoomControl({ zoom }: { zoom: CameraZoom }) {
  const distance = useSyncExternalStore(zoom.subscribe, zoom.getDistance)
  const { minDistance, maxDistance, defaultDistance } = zoom
  const levelPercent = Math.round((defaultDistance / distance) * 100)

  return (
    <div
      role="group"
      aria-label="Camera zoom"
      className="glass camera-zoom flex items-center rounded-2xl"
      data-shell-ui
      data-zoom-control
    >
      <ZoomButton
        label="Zoom in"
        disabled={distance <= minDistance}
        onClick={() => zoom.zoomBy(1 / CAMERA_ZOOM.buttonFactor)}
      >
        <PlusIcon />
      </ZoomButton>
      <button
        type="button"
        aria-label={`Zoom ${levelPercent}%. Reset zoom`}
        title="Reset zoom"
        className="h-[30px] w-[42px] cursor-pointer text-xs font-semibold text-accent tabular-nums"
        data-zoom-level
        onClick={() => zoom.reset()}
      >
        {levelPercent}%
      </button>
      <ZoomButton
        label="Zoom out"
        disabled={distance >= maxDistance}
        onClick={() => zoom.zoomBy(CAMERA_ZOOM.buttonFactor)}
      >
        <MinusIcon />
      </ZoomButton>
    </div>
  )
}
