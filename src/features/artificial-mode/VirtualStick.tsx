import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { TOUCH_STICK } from '../../config/flight'

/** Each axis has its own dead zone, so a drift sideways while climbing doesn't also turn the drone. */
export function shapeStickAxis(value: number) {
  const { deadZone, expo } = TOUCH_STICK
  const size = Math.abs(value)
  if (size <= deadZone) return 0
  return Math.sign(value) * ((Math.min(size, 1) - deadZone) / (1 - deadZone)) ** expo
}

interface VirtualStickProps {
  /** Spoken name of the stick, and what it controls. */
  label: string
  /** Called with values from -1 to +1. Positive is right and up. */
  onChange: (x: number, y: number) => void
  /** Drawn beside the stick's base, and doesn't react to touch. */
  children?: ReactNode
  name: string
}

/**
 * One thumb stick, which springs back to centre. Each stick follows only the first
 * finger on it, so both thumbs work at once. The knob is moved directly rather than
 * through React, because this runs for every movement of the finger.
 */
export function VirtualStick({ label, onChange, children, name }: VirtualStickProps) {
  const base = useRef<HTMLDivElement>(null)
  const knob = useRef<HTMLDivElement>(null)
  const pointerId = useRef<number | null>(null)
  const latestOnChange = useRef(onChange)

  useEffect(() => {
    latestOnChange.current = onChange
  }, [onChange])

  const moveTo = (clientX: number, clientY: number) => {
    if (!base.current || !knob.current) return

    const rect = base.current.getBoundingClientRect()
    const radius = rect.width / 2
    const dx = (clientX - (rect.left + radius)) / radius
    const dy = (clientY - (rect.top + radius)) / radius
    const distance = Math.hypot(dx, dy)
    const scale = distance > 1 ? 1 / distance : 1
    const x = dx * scale
    const y = dy * scale

    knob.current.style.transform = `translate(${x * radius * TOUCH_STICK.knobTravel}px, ${y * radius * TOUCH_STICK.knobTravel}px)`
    latestOnChange.current(shapeStickAxis(x), shapeStickAxis(-y))
  }

  const release = () => {
    if (pointerId.current === null) return
    pointerId.current = null
    if (knob.current) knob.current.style.transform = ''
    latestOnChange.current(0, 0)
  }

  // A finger can be lost without a release, when the page is hidden or a system gesture takes over.
  useEffect(() => {
    const releaseIfHidden = () => {
      if (document.hidden) release()
    }
    window.addEventListener('blur', release)
    document.addEventListener('visibilitychange', releaseIfHidden)
    return () => {
      window.removeEventListener('blur', release)
      document.removeEventListener('visibilitychange', releaseIfHidden)
      release()
    }
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== null) return
    pointerId.current = event.pointerId
    event.currentTarget.setPointerCapture(event.pointerId)
    moveTo(event.clientX, event.clientY)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId === pointerId.current) moveTo(event.clientX, event.clientY)
  }

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId === pointerId.current) release()
  }

  return (
    <div
      role="group"
      aria-label={label}
      className="virtual-stick"
      data-shell-ui
      data-stick={name}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
    >
      <div ref={base} className="virtual-stick-base">
        <div ref={knob} className="virtual-stick-knob" data-stick-knob />
      </div>
      {children}
    </div>
  )
}
