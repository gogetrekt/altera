import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | React.ReactNode
  /** Optional supporting detail line below the value */
  detail?: string | React.ReactNode
  /** Icon rendered in the top-left corner */
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  /** When true, renders skeleton placeholders instead of value/detail */
  isLoading?: boolean
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded skeleton-shimmer',
        className,
      )}
      aria-hidden="true"
    />
  )
}

/**
 * Displays a single numeric metric with label and optional supporting detail.
 * All numeric values must be passed pre-formatted as font-data strings.
 * Never shows fabricated or hardcoded change percentages.
 */
export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  className,
  isLoading = false,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-md border border-border bg-card px-4 py-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      {isLoading ? (
        <>
          <SkeletonBar className="h-7 w-28" />
          <SkeletonBar className="h-3.5 w-20" />
        </>
      ) : (
        <>
          <div className="font-data text-xl font-semibold text-foreground leading-none tabular-nums">
            {value}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{label}</p>
            {detail && (
              <span className="text-xs text-muted-foreground">{detail}</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
