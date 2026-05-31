import { cn } from '@/lib/utils'
import { TriangleAlert, Info, ShieldAlert, FlaskConical } from 'lucide-react'

export type RiskBannerVariant = 'warning' | 'danger' | 'info' | 'simulation'

interface RiskBannerProps {
  variant?: RiskBannerVariant
  title?: string
  children: React.ReactNode
  className?: string
}

const variantConfig: Record<
  RiskBannerVariant,
  {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
    classes: string
    titleColor: string
    textColor: string
    iconColor: string
  }
> = {
  // Amber = risk/warning signal: real ETH, wrong network, unaudited
  warning: {
    icon: TriangleAlert,
    classes: 'border border-warning/20 border-l-4 border-l-warning bg-warning/5',
    titleColor: 'text-warning',
    textColor: 'text-warning/80',
    iconColor: 'text-warning',
  },
  // Red = destructive / error
  danger: {
    icon: ShieldAlert,
    classes: 'border border-destructive/20 border-l-4 border-l-destructive bg-destructive/5',
    titleColor: 'text-destructive',
    textColor: 'text-destructive/80',
    iconColor: 'text-destructive',
  },
  // Neutral structural info
  info: {
    icon: Info,
    classes: 'border border-border border-l-4 border-l-border-strong bg-surface-2',
    titleColor: 'text-foreground',
    textColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground',
  },
  // Violet = simulation-only features
  simulation: {
    icon: FlaskConical,
    classes: 'border border-simulation/20 border-l-4 border-l-simulation bg-simulation/5',
    titleColor: 'text-simulation',
    textColor: 'text-simulation/80',
    iconColor: 'text-simulation',
  },
}

export function RiskBanner({
  variant = 'warning',
  title,
  children,
  className,
}: RiskBannerProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md px-4 py-3',
        config.classes,
        className,
      )}
    >
      <Icon
        className={cn('h-4 w-4 shrink-0 mt-0.5', config.iconColor)}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn('text-sm font-semibold mb-0.5', config.titleColor)}>{title}</p>
        )}
        <div className={cn('text-sm leading-relaxed', config.textColor)}>{children}</div>
      </div>
    </div>
  )
}
