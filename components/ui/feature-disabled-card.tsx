import { cn } from '@/lib/utils'
import { Clock, Lock, type LucideIcon } from 'lucide-react'

export type FeatureDisabledVariant = 'coming-soon' | 'phase-2' | 'not-deployed'

interface FeatureDisabledCardProps {
  variant?: FeatureDisabledVariant
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

const variantConfig: Record<
  FeatureDisabledVariant,
  { label: string; sublabel: string; icon: LucideIcon }
> = {
  'coming-soon': {
    label: 'Coming Soon',
    sublabel: 'This feature is not yet available.',
    icon: Clock,
  },
  'phase-2': {
    label: 'Phase 2 Feature',
    sublabel: 'Not available in the current release.',
    icon: Clock,
  },
  'not-deployed': {
    label: 'Not Deployed',
    sublabel: 'The underlying contract is not yet deployed on this network.',
    icon: Lock,
  },
}

/**
 * Wraps disabled feature UI with a clear non-interactive overlay.
 * Children are rendered but pointer-events-none + dimmed.
 * Required by audit remediation -- disabled features must look non-functional.
 */
export function FeatureDisabledCard({
  variant = 'phase-2',
  title,
  description,
  children,
  className,
}: FeatureDisabledCardProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title ?? config.label
  const displayDesc = description ?? config.sublabel

  if (children) {
    return (
      <div className={cn('relative rounded-lg overflow-hidden', className)}>
        {/* Dimmed, non-interactive content beneath */}
        <div
          className="pointer-events-none select-none opacity-25 blur-[1px]"
          aria-hidden="true"
        >
          {children}
        </div>

        {/* Overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 bg-background/75 backdrop-blur-[2px]"
          role="status"
          aria-label={displayTitle}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 border border-border">
            <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{displayTitle}</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[30ch] leading-relaxed">
              {displayDesc}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Standalone card when no children
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-6 min-h-45',
        'rounded-lg border border-border bg-surface-1',
        className,
      )}
      role="status"
      aria-label={displayTitle}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 border border-border">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{displayTitle}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-[30ch] leading-relaxed">
          {displayDesc}
        </p>
      </div>
    </div>
  )
}
