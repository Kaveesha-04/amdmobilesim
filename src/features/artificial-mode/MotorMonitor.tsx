import { memo, useSyncExternalStore } from 'react'
import { MOTOR_HIGH_OUTPUT, PROPELLERS, VIRTUAL_MOTOR_MAX_RPM } from '../../config/flight'
import { useDisplayPreferences } from '../../hooks/useDisplayPreferences'
import { setDisplayPreferences } from '../../stores/displayPreferences'
import type { FlightStore } from '../../stores/flightStore'
import { readMotor, summarizeMotors } from './motorReadings'

type Propeller = (typeof PROPELLERS)[number]

const GAUGE_RADIUS = 30
const GAUGE_LENGTH = 2 * Math.PI * GAUGE_RADIUS

/**
 * Matches how often the simulation publishes values, so that each change glides into
 * the next. "Reduce visual effects" turns this off, in index.css. Each gauge also has
 * its own layer, so that animating it doesn't repaint the rest of the panel.
 */
const GAUGE_TRANSITION = 'transition-[stroke-dashoffset,stroke] duration-100 ease-linear'

function gaugeColour(output: number) {
  if (output <= 0) return 'stroke-slate-600'
  return output >= MOTOR_HIGH_OUTPUT ? 'stroke-warn' : 'stroke-accent'
}

/** A tiny top-down drone with this motor's corner lit, so that its position reads at a glance. */
function CornerIcon({ side, end }: Pick<Propeller, 'side' | 'end'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-6 shrink-0">
      <path d="M4 4l8 8M12 4l-8 8" className="stroke-slate-500" strokeWidth="1" />
      {PROPELLERS.map((corner) => (
        <circle
          key={corner.motor}
          cx={8 + corner.side * 4.5}
          cy={8 + corner.end * 4.5}
          r="2"
          className={corner.side === side && corner.end === end ? 'fill-accent' : 'fill-slate-600'}
        />
      ))}
    </svg>
  )
}

interface MotorCardProps {
  propeller: Propeller
  output: number
}

/** Memoized, so that a card redraws only when its own motor's output has changed. */
const MotorCard = memo(function MotorCard({ propeller, output }: MotorCardProps) {
  const { motor, position, side, end } = propeller
  const reading = readMotor(output)

  return (
    <article
      aria-label={`Motor ${motor}, ${position}`}
      className="rounded-xl border border-white/10 bg-slate-950/40 p-3 transition-colors duration-150 hover:border-accent/50 hover:bg-slate-950/60"
      data-motor={motor}
      data-motor-output={reading.output}
    >
      <header className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold">Motor {motor}</h4>
          <p className="text-xs text-slate-300">{position}</p>
        </div>
        <CornerIcon side={side} end={end} />
      </header>

      <div className="relative mx-auto mt-2 size-20">
        <svg aria-hidden="true" viewBox="0 0 72 72" className="size-full -rotate-90 will-change-transform">
          <circle cx="36" cy="36" r={GAUGE_RADIUS} fill="none" strokeWidth="6" className="stroke-white/10" />
          <circle
            cx="36"
            cy="36"
            r={GAUGE_RADIUS}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={GAUGE_LENGTH}
            strokeDashoffset={GAUGE_LENGTH * (1 - reading.output)}
            className={`${GAUGE_TRANSITION} ${gaugeColour(reading.output)}`}
            data-motor-gauge
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums"
          data-motor-percent
        >
          {reading.percent}%
        </span>
      </div>

      <p className="mt-2 text-center text-xl leading-tight font-semibold tabular-nums" data-motor-rpm>
        {reading.rpm.toLocaleString('en-US')}
      </p>
      <p className="text-center text-xs text-slate-400">Estimated RPM</p>

      <p
        className={`mt-2 flex items-center justify-center gap-1.5 text-xs font-medium ${reading.isRunning ? 'text-accent' : 'text-slate-400'}`}
        data-motor-status
      >
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${reading.isRunning ? 'bg-accent' : 'bg-slate-500'}`}
        />
        {reading.isRunning ? 'Running' : 'Stopped'}
      </p>
    </article>
  )
})

/** Top-down, with the front at the top, and each corner brighter as its output rises. */
function MotorLayout({ outputs }: { outputs: number[] }) {
  return (
    <figure className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
      <svg
        role="img"
        aria-label="Top-down view of the four motors in an X layout, with the front at the top"
        viewBox="0 0 160 136"
        className="mx-auto w-full max-w-56"
      >
        <text x="80" y="11" textAnchor="middle" className="fill-slate-400 text-[9px]">
          FRONT
        </text>
        <path d="M80 17l-5 8h10z" className="fill-slate-400" />
        <path d="M44 44l72 64M116 44l-72 64" className="stroke-slate-500" strokeWidth="4" strokeLinecap="round" />
        <rect x="68" y="64" width="24" height="24" rx="4" className="fill-slate-700 stroke-slate-500" />
        {PROPELLERS.map(({ motor, position, side, end }, index) => {
          const { output, percent } = readMotor(outputs[index] ?? 0)
          const x = 80 + side * 36
          const y = 76 + end * 32
          return (
            <g key={motor} data-layout-motor={motor} data-layout-side={side} data-layout-end={end}>
              <title>
                Motor {motor}, {position}: {percent}%
              </title>
              <circle cx={x} cy={y} r="17" className="fill-slate-900 stroke-slate-500" />
              <circle
                cx={x}
                cy={y}
                r="17"
                className={`transition-[fill-opacity] duration-100 ease-linear ${output >= MOTOR_HIGH_OUTPUT ? 'fill-warn' : 'fill-accent'}`}
                fillOpacity={output}
                data-layout-intensity
              />
              <text x={x} y={y + 3.5} textAnchor="middle" className="fill-slate-50 text-[10px] font-semibold">
                M{motor}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

function Summary({ label, value, name }: { label: string; value: string; name: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-base font-semibold tabular-nums" data-motor-summary={name}>
        {value}
      </dd>
    </div>
  )
}

/**
 * Shows the outputs the simulator already works out for each virtual motor. It reads
 * them from the snapshot the simulation publishes, so it adds no loop of its own. The
 * gauges are costly to paint, so this is only mounted on its own tab of the panel.
 */
export function MotorMonitor({ store }: { store: FlightStore }) {
  const { motorOutputs } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const summary = summarizeMotors(motorOutputs)
  const { showMotorIndicators } = useDisplayPreferences()

  return (
    <section aria-label="Motor Monitor" className="glass-section space-y-3">
      <div>
        <h3 className="text-sm font-semibold">Motor Monitor</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Virtual motors only. RPM is estimated from each output, up to{' '}
          {VIRTUAL_MOTOR_MAX_RPM.toLocaleString('en-US')} at full output, and is not measured from
          the real drone.
        </p>
      </div>

      <button
        type="button"
        aria-pressed={showMotorIndicators}
        className="glass-button flex w-full items-center justify-between gap-3 aria-pressed:border-accent aria-pressed:text-accent"
        data-motor-indicators-toggle
        onClick={() => setDisplayPreferences({ showMotorIndicators: !showMotorIndicators })}
      >
        Speed indicators on drone
        <span className="font-semibold">{showMotorIndicators ? 'On' : 'Off'}</span>
      </button>

      <div className="grid grid-cols-2 gap-2">
        {PROPELLERS.map((propeller, index) => (
          <MotorCard key={propeller.motor} propeller={propeller} output={motorOutputs[index] ?? 0} />
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
        <Summary label="Average output" value={`${summary.averagePercent}%`} name="average" />
        <Summary label="Active motors" value={`${summary.activeCount} of ${motorOutputs.length}`} name="active" />
        <Summary label="Highest (est. RPM)" value={summary.highestRpm.toLocaleString('en-US')} name="highest" />
        <Summary label="Lowest (est. RPM)" value={summary.lowestRpm.toLocaleString('en-US')} name="lowest" />
      </dl>

      <MotorLayout outputs={motorOutputs} />
    </section>
  )
}
