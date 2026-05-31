import { cn } from '@/lib/utils'
import { TriangleAlert, Info, ShieldAlert } from 'lucide-react'

export type RiskBannerVariant = 'warning' | 'danger' | 'info'

interface RiskBannerProps {
  variant?: RiskBannerVariant
  title?: string
  children: React.ReactNode
  className?: string
  /** Set to true for audit-required banners that cannot be hidden */
  persistent?: boolean
}

const variantConfig: Record<
  RiskBannerVariant,
  {
    icon: React.ComponentType<{ className?: string }>
    border: string
    bg: string
    titleColor: string
    textColor: string
    iconColor: string
  }
> = {
  warning: {
    icon: TriangleAlert,
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/5',
    titleColor: 'text-amber-400',
    textColor: 'text-amber-400/80',
    iconColor: 'text-amber-400',
  },
  danger: {
    icon: ShieldAlert,
    border: 'border-red-500/40',
    bg: 'bg-red-500/5',
    titleColor: 'text-red-400',
    textColor: 'text-red-400/80',
    iconColor: 'text-red-400',
  },
  info: {
    icon: Info,
    border: 'border-zinc-600/50',
    bg: 'bg-zinc-800/40',
    titleColor: 'text-zinc-300',
    textColor: 'text-zinc-400',
    iconColor: 'text-zinc-400',
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
        'flex items-start gap-3 rounded-md border px-4 py-3',
        config.border,
        config.bg,
        className,
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn('text-sm font-semibold mb-0.5', config.titleColor)}>{title}</p>
        )}
        <div className={cn('text-sm leading-relaxed', config.textColor)}>{children}</div>
      </div>
    </div>
  )
}
