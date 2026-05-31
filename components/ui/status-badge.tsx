import { cn } from '@/lib/utils'
import { Clock, FlaskConical, Wifi, WifiOff, CircleDot, CircleOff } from 'lucide-react'

export type StatusBadgeVariant =
  | 'testnet'
  | 'mainnet'
  | 'simulation'
  | 'coming-soon'
  | 'live'
  | 'disabled'
  | 'phase-2'

interface StatusBadgeProps {
  variant: StatusBadgeVariant
  label?: string
  className?: string
}

const variantConfig: Record<
  StatusBadgeVariant,
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  testnet: {
    label: 'Sepolia Testnet',
    icon: ({ className }) => <CircleDot className={className} />,
    classes:
      'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60',
  },
  mainnet: {
    label: 'Base Mainnet',
    icon: ({ className }) => <CircleDot className={className} />,
    classes:
      'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  },
  simulation: {
    label: 'Simulation Only',
    icon: ({ className }) => <FlaskConical className={className} />,
    classes:
      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
  },
  'coming-soon': {
    label: 'Coming Soon',
    icon: ({ className }) => <Clock className={className} />,
    classes:
      'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40',
  },
  live: {
    label: 'Live',
    icon: ({ className }) => (
      <span className={cn('block h-1.5 w-1.5 rounded-full bg-green-400 pulse-live', className)} />
    ),
    classes:
      'bg-green-500/10 text-green-400 border border-green-500/30',
  },
  disabled: {
    label: 'Disabled',
    icon: ({ className }) => <CircleOff className={className} />,
    classes:
      'bg-zinc-800/40 text-zinc-500 border border-zinc-700/30',
  },
  'phase-2': {
    label: 'Phase 2',
    icon: ({ className }) => <Clock className={className} />,
    classes:
      'bg-zinc-800/60 text-zinc-400 border border-zinc-700/40',
  },
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayLabel = label ?? config.label

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5',
        'text-[11px] font-medium tracking-wide uppercase font-mono',
        config.classes,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {displayLabel}
    </span>
  )
}
