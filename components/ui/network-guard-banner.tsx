'use client'

import { TriangleAlert, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NetworkGuardBannerProps {
  expectedNetwork: string
  isWrongNetwork: boolean
  isNotConnected?: boolean
  className?: string
}

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
          'flex items-start gap-3 rounded-md',
          'border border-border border-l-4 border-l-border-strong',
          'bg-surface-2 px-4 py-3',
          className,
        )}
      >
        <Wifi
          className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <p className="text-sm text-muted-foreground">
          Connect your wallet to interact with this page.
        </p>
      </div>
    )
  }

  // Amber = wrong network warning (risk signal)
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-md',
        'border border-warning/20 border-l-4 border-l-warning',
        'bg-warning/5 px-4 py-3',
        className,
      )}
    >
      <TriangleAlert
        className="h-4 w-4 shrink-0 mt-0.5 text-warning"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <p className="text-sm text-warning/90">
        This page operates on{' '}
        <strong className="text-warning font-semibold">{expectedNetwork}</strong>.
        Your wallet is connected to a different network. Switch networks to continue.
      </p>
    </div>
  )
}
