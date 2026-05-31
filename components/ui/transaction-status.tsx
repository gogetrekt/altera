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
  successMessage?: string
  txHash?: string
  explorer?: 'sepolia' | 'base'
  errorMessage?: string
  className?: string
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

  const isPending = state === 'approving' || state === 'pending' || state === 'confirming'
  const isSuccess = state === 'success'
  const isError = state === 'failed' || state === 'reverted'
  const isRejected = state === 'rejected'

  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3',
        isPending && 'border-border bg-surface-2',
        isSuccess && 'border-success/25 border-l-4 border-l-success bg-success/5',
        isError && 'border-destructive/25 border-l-4 border-l-destructive bg-destructive/5',
        isRejected && 'border-border bg-surface-2',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          {isPending && (
            // Cobalt spinner = action in progress
            <Loader2 className="h-4 w-4 text-primary animate-spin" strokeWidth={1.5} />
          )}
          {isSuccess && (
            <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.5} />
          )}
          {isError && (
            <XCircle className="h-4 w-4 text-destructive" strokeWidth={1.5} />
          )}
          {isRejected && (
            <Ban className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {state === 'approving' && (
            <p className="text-sm text-foreground">Awaiting approval in wallet...</p>
          )}
          {state === 'pending' && (
            <p className="text-sm text-foreground">Transaction submitted. Waiting for confirmation...</p>
          )}
          {state === 'confirming' && (
            <p className="text-sm text-foreground">Confirming on-chain...</p>
          )}
          {isSuccess && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-success">Transaction confirmed</p>
              {successMessage && (
                <p className="text-xs text-success/70">{successMessage}</p>
              )}
              {explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors duration-150 cursor-pointer"
                >
                  View on explorer
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                </a>
              )}
            </div>
          )}
          {state === 'failed' && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Transaction failed</p>
              {errorMessage && (
                <p className="text-xs text-destructive/70">{errorMessage}</p>
              )}
            </div>
          )}
          {state === 'reverted' && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Transaction reverted</p>
              <p className="text-xs text-destructive/70">
                {errorMessage ?? 'The contract rejected this transaction. Check your inputs and try again.'}
              </p>
            </div>
          )}
          {isRejected && (
            <p className="text-sm text-muted-foreground">Transaction cancelled by user.</p>
          )}
        </div>

        {onReset && (isSuccess || isError || isRejected) && (
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
            aria-label="Dismiss"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}
