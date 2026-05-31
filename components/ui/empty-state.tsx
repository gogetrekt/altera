import { cn } from '@/lib/utils'
import { Wallet, ArrowRight, Clock, BarChart2, Droplets, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

export type EmptyStateVariant =
  | 'no-wallet'
  | 'no-data'
  | 'coming-soon'
  | 'no-tokens'
  | 'no-positions'
  | 'no-activity'

interface EmptyStateProps {
  variant: EmptyStateVariant
  title?: string
  description?: string
  action?: {
    label: string
    href: string
  }
  className?: string
}

const variantDefaults: Record<
  EmptyStateVariant,
  { icon: LucideIcon; title: string; description: string }
> = {
  'no-wallet': {
    icon: Wallet,
    title: 'Wallet not connected',
    description: 'Connect your wallet to view this information.',
  },
  'no-data': {
    icon: BarChart2,
    title: 'No data available',
    description: 'There is nothing to display here yet.',
  },
  'coming-soon': {
    icon: Clock,
    title: 'Coming in Phase 2',
    description: 'This feature is not yet available.',
  },
  'no-tokens': {
    icon: Droplets,
    title: 'No tokens found',
    description: 'Claim test tokens from the faucet to get started.',
  },
  'no-positions': {
    icon: BarChart2,
    title: 'No open positions',
    description: 'You have no active positions in this pool.',
  },
  'no-activity': {
    icon: BarChart2,
    title: 'No recent activity',
    description: 'Your on-chain activity will appear here after your first transaction.',
  },
}

export function EmptyState({
  variant,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const defaults = variantDefaults[variant]
  const Icon = defaults.icon
  const displayTitle = title ?? defaults.title
  const displayDesc = description ?? defaults.description

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-10 px-4 text-center',
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 border border-border">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{displayTitle}</p>
        <p className="text-xs text-muted-foreground max-w-[28ch] mx-auto leading-relaxed">
          {displayDesc}
        </p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors duration-150 cursor-pointer mt-1"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  )
}
