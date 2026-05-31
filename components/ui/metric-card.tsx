import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | React.ReactNode
  detail?: string | React.ReactNode
  icon?: LucideIcon
  className?: string
  isLoading?: boolean
}

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded skeleton-shimmer', className)}
      aria-hidden="true"
    />
  )
}

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
        'flex flex-col gap-2 rounded-lg border border-border bg-surface-1 px-5 py-4',
        className,
      )}
    >
      {Icon && (
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" strokeWidth={1.5} />
      )}

      {isLoading ? (
        <>
          <SkeletonBar className="h-7 w-28 mt-1" />
          <SkeletonBar className="h-3.5 w-20" />
        </>
      ) : (
        <>
          <div className="font-data text-2xl font-medium text-foreground leading-none tabular-nums">
            {value}
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">{label}</p>
            {detail && (
              <span className="text-xs text-muted-foreground font-data">{detail}</span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
