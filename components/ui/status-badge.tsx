import { cn } from '@/lib/utils'
import { Clock, FlaskConical, CircleDot, CircleOff } from 'lucide-react'

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
  { label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; classes: string }
> = {
  testnet: {
    label: 'Sepolia Testnet',
    icon: ({ className }) => <CircleDot className={className} strokeWidth={1.5} />,
    classes: 'bg-surface-2 text-muted-foreground border border-border',
  },
  mainnet: {
    // Amber = risk/warning signal. Mainnet badge signals real-money context.
    label: 'Base Mainnet',
    icon: ({ className }) => <CircleDot className={className} strokeWidth={1.5} />,
    classes: 'bg-warning/8 text-warning border border-warning/30',
  },
  simulation: {
    // Violet = simulation-only, reserved for Perpetual preview
    label: 'Simulation Only',
    icon: ({ className }) => <FlaskConical className={className} strokeWidth={1.5} />,
    classes: 'bg-simulation/10 text-simulation border border-simulation/30',
  },
  'coming-soon': {
    label: 'Coming Soon',
    icon: ({ className }) => <Clock className={className} strokeWidth={1.5} />,
    classes: 'bg-surface-2 text-muted-foreground border border-border-subtle',
  },
  live: {
    label: 'Live',
    icon: ({ className }) => (
      <span className={cn('block h-1.5 w-1.5 rounded-full bg-success pulse-live', className)} />
    ),
    classes: 'bg-success/10 text-success border border-success/30',
  },
  disabled: {
    label: 'Disabled',
    icon: ({ className }) => <CircleOff className={className} strokeWidth={1.5} />,
    classes: 'bg-surface-2 text-foreground/30 border border-border-subtle',
  },
  'phase-2': {
    label: 'Phase 2',
    icon: ({ className }) => <Clock className={className} strokeWidth={1.5} />,
    classes: 'bg-surface-2 text-muted-foreground border border-border-subtle',
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
