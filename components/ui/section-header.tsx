import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  description?: string
  /** Optional slot for badges or action buttons rendered on the right */
  action?: React.ReactNode
  className?: string
  /** Heading level -- defaults to h1 for top-level page headers */
  as?: 'h1' | 'h2' | 'h3'
}

export function SectionHeader({
  title,
  description,
  action,
  className,
  as: Tag = 'h1',
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <Tag
          className={cn(
            'font-semibold tracking-tight text-foreground',
            Tag === 'h1' && 'text-2xl',
            Tag === 'h2' && 'text-xl',
            Tag === 'h3' && 'text-base',
          )}
        >
          {title}
        </Tag>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
    </div>
  )
}
