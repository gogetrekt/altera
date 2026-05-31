import { cn } from '@/lib/utils'
import { Clock, Lock, type LucideIcon } from 'lucide-react'

export type FeatureDisabledVariant = 'coming-soon' | 'phase-2' | 'not-deployed'

interface FeatureDisabledCardProps {
  variant?: FeatureDisabledVariant
  title?: string
  description?: string
  /** The interactive UI to show dimmed beneath the overlay */
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
 * Wraps a disabled feature's UI with a clear visual overlay.
 * All children are rendered but non-interactive (pointer-events-none + dim).
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

  return (
    <div className={cn('relative rounded-md overflow-hidden', className)}>
      {/* Dimmed background content */}
      {children && (
        <div
          className="pointer-events-none select-none opacity-30 blur-[1px]"
          aria-hidden="true"
        >
          {children}
        </div>
      )}

      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center gap-3 p-6',
          'bg-background/80 backdrop-blur-sm',
          !children && 'relative inset-auto flex min-h-45 rounded-md border border-zinc-700/40 bg-zinc-900/60',
        )}
        role="status"
        aria-label={displayTitle}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 border border-zinc-700/40">
          <Icon className="h-5 w-5 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-300">{displayTitle}</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-[30ch] leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>
    </div>
  )
}
