import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MainnetWarningProps {
  detail?: string
  className?: string
}

/**
 * Mandatory warning for pages that interact with Base Mainnet and spend real ETH.
 * Server Component -- cannot be hidden. Required by audit remediation.
 */
export function MainnetWarning({ detail, className }: MainnetWarningProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 rounded-md px-4 py-3',
        'border border-warning/25 border-l-4 border-l-warning bg-warning/6',
        className,
      )}
    >
      <ShieldAlert
        className="h-4 w-4 shrink-0 mt-0.5 text-warning"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <div>
        <p className="text-sm font-semibold text-warning mb-0.5">
          Real ETH required — Base Mainnet
        </p>
        <p className="text-sm text-warning/80 leading-relaxed">
          This transaction uses{' '}
          <strong className="text-warning font-semibold">real ETH on Base Mainnet</strong>.
          {detail
            ? ` ${detail}`
            : ' Ensure you have sufficient ETH in your wallet before proceeding.'}
          {' '}Contracts are unaudited. Use at your own risk.
        </p>
      </div>
    </div>
  )
}
