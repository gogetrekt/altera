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
  {
    icon: LucideIcon
    title: string
    description: string
  }
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
    description: 'This feature is not yet available. Check back soon.',
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
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/60 border border-zinc-700/40">
        <Icon className="h-5 w-5 text-zinc-500" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-300">{displayTitle}</p>
        <p className="text-xs text-zinc-500 max-w-[28ch] mx-auto leading-relaxed">
          {displayDesc}
        </p>
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors duration-150 cursor-pointer mt-1"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      )}
    </div>
  )
}
