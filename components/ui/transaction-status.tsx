'use client'

import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Ban,
  RotateCcw,
} from 'lucide-react'

export type TxState =
  | 'idle'
  | 'approving'
  | 'pending'
  | 'confirming'
  | 'success'
  | 'failed'
  | 'rejected'
  | 'reverted'

interface TransactionStatusProps {
  state: TxState
  /** Human-readable description of what was done, shown on success e.g. "Swapped 1.0 dETH for 2953 dUSDC" */
  successMessage?: string
  /** Tx hash for block explorer link */
  txHash?: string
  /** "sepolia" | "base" -- determines which explorer to link */
  explorer?: 'sepolia' | 'base'
  /** Error message shown on failure or revert */
  errorMessage?: string
  className?: string
  /** Callback to reset the status back to idle */
  onReset?: () => void
}

const explorerBaseUrl: Record<string, string> = {
  sepolia: 'https://sepolia.etherscan.io/tx/',
  base: 'https://basescan.org/tx/',
}

export function TransactionStatus({
  state,
  successMessage,
  txHash,
  explorer = 'sepolia',
  errorMessage,
  className,
  onReset,
}: TransactionStatusProps) {
  if (state === 'idle') return null

  const explorerUrl = txHash ? `${explorerBaseUrl[explorer]}${txHash}` : undefined

  return (
    <div
      className={cn('rounded-md border px-4 py-3', className, {
        'border-zinc-700/60 bg-zinc-800/40': state === 'approving' || state === 'pending' || state === 'confirming',
        'border-green-500/30 bg-green-500/5': state === 'success',
        'border-red-500/30 bg-red-500/5': state === 'failed' || state === 'reverted',
        'border-zinc-600/50 bg-zinc-800/30': state === 'rejected',
      })}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {(state === 'approving' || state === 'pending' || state === 'confirming') && (
            <Loader2 className="h-4 w-4 text-amber-400 animate-spin" strokeWidth={1.5} />
          )}
          {state === 'success' && (
            <CheckCircle2 className="h-4 w-4 text-green-400" strokeWidth={1.5} />
          )}
          {(state === 'failed' || state === 'reverted') && (
            <XCircle className="h-4 w-4 text-red-400" strokeWidth={1.5} />
          )}
          {state === 'rejected' && (
            <Ban className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {state === 'approving' && (
            <p className="text-sm text-zinc-300">Awaiting approval in wallet...</p>
          )}
          {state === 'pending' && (
            <p className="text-sm text-zinc-300">Transaction submitted. Waiting for confirmation...</p>
          )}
          {state === 'confirming' && (
            <p className="text-sm text-zinc-300">Confirming on-chain...</p>
          )}
          {state === 'success' && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-400">Transaction confirmed</p>
              {successMessage && (
                <p className="text-xs text-green-400/70">{successMessage}</p>
              )}
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors duration-150 cursor-pointer"
                >
                  View on explorer
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                </a>
              )}
            </div>
          )}
          {state === 'failed' && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-400">Transaction failed</p>
              {errorMessage && (
                <p className="text-xs text-red-400/70">{errorMessage}</p>
              )}
            </div>
          )}
          {state === 'reverted' && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-400">Transaction reverted</p>
              <p className="text-xs text-red-400/70">
                {errorMessage ?? 'The contract rejected this transaction. Check your inputs and try again.'}
              </p>
            </div>
          )}
          {state === 'rejected' && (
            <p className="text-sm text-zinc-400">Transaction cancelled by user.</p>
          )}
        </div>

        {/* Reset button for error/success states */}
        {onReset && (state === 'success' || state === 'failed' || state === 'reverted' || state === 'rejected') && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors duration-150 cursor-pointer"
            aria-label="Dismiss"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}
