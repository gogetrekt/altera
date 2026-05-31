import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MainnetWarningProps {
  /** Additional context e.g. the exact ETH amount required */
  detail?: string
  className?: string
}

/**
 * Mandatory warning for pages that interact with Base Mainnet and spend real ETH.
 * Required by audit remediation phase. Cannot be hidden.
 */
export function MainnetWarning({ detail, className }: MainnetWarningProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 rounded-md border border-amber-500/50 bg-amber-500/8 px-4 py-3',
        className,
      )}
    >
      <ShieldAlert
        className="h-4 w-4 shrink-0 mt-0.5 text-amber-400"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <div>
        <p className="text-sm font-semibold text-amber-400 mb-0.5">
          Real ETH required - Base Mainnet
        </p>
        <p className="text-sm text-amber-400/80 leading-relaxed">
          This transaction uses{' '}
          <strong className="text-amber-400 font-semibold">real ETH on Base Mainnet</strong>.
          {detail ? ` ${detail}` : ' Ensure you have sufficient ETH in your wallet before proceeding.'}
          {' '}Contracts are unaudited. Use at your own risk.
        </p>
      </div>
    </div>
  )
}
