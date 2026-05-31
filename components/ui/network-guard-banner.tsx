'use client'

import { TriangleAlert, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkGuardBannerProps {
  /** The expected network name for display, e.g. "Sepolia" */
  expectedNetwork: string
  /** Whether the wallet is connected but on wrong network */
  isWrongNetwork: boolean
  /** Whether the wallet is not connected at all */
  isNotConnected?: boolean
  className?: string
}

/**
 * Inline banner shown when wallet is connected to wrong network.
 * Must appear above any transaction button. Required by audit remediation.
 */
export function NetworkGuardBanner({
  expectedNetwork,
  isWrongNetwork,
  isNotConnected = false,
  className,
}: NetworkGuardBannerProps) {
  if (!isWrongNetwork && !isNotConnected) return null

  if (isNotConnected) {
    return (
      <div
        role="status"
        className={cn(
          'flex items-start gap-3 rounded-md border border-zinc-600/50 bg-zinc-800/40 px-4 py-3',
          className,
        )}
      >
        <Wifi
          className="h-4 w-4 shrink-0 mt-0.5 text-zinc-400"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <p className="text-sm text-zinc-400">
          Connect your wallet to interact with this page.
        </p>
      </div>
    )
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3',
        className,
      )}
    >
      <TriangleAlert
        className="h-4 w-4 shrink-0 mt-0.5 text-amber-400"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <p className="text-sm text-amber-400/90">
        This page operates on{' '}
        <strong className="text-amber-400 font-semibold">{expectedNetwork}</strong>.
        Your wallet is connected to a different network. Switch networks to continue.
      </p>
    </div>
  )
}
