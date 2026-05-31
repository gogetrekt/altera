import { FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SimulationBannerProps {
  className?: string
}

/**
 * Mandatory simulation disclaimer for Perpetual trading page.
 * Server Component -- cannot be toggled off by client state.
 * Required by audit remediation. Always renders above fold.
 */
export function SimulationBanner({ className }: SimulationBannerProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-md px-4 py-3',
        'border border-simulation/20 border-l-4 border-l-simulation bg-simulation/5',
        className,
      )}
    >
      <FlaskConical
        className="h-4 w-4 shrink-0 mt-0.5 text-simulation"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <div>
        <p className="text-sm font-semibold text-simulation mb-0.5">
          Simulated trading only
        </p>
        <p className="text-sm text-simulation/80 leading-relaxed">
          No real funds are involved. All positions, prices, and P&amp;L shown here are
          for demonstration purposes only and do not represent real trades or financial
          activity. This is a preview of a Phase 2 feature.
        </p>
      </div>
    </div>
  )
}
