'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface TokenOption {
  symbol: string
  name: string
  address?: string
}

interface TokenAmountInputProps {
  label: string
  value: string
  onChange?: (value: string) => void
  balance?: string
  token: TokenOption
  tokens?: TokenOption[]
  onTokenSelect?: (token: TokenOption) => void
  onMax?: () => void
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  isLoading?: boolean
}

export function TokenAmountInput({
  label,
  value,
  onChange,
  balance,
  token,
  tokens,
  onTokenSelect,
  onMax,
  readonly = false,
  disabled = false,
  placeholder = '0.0',
  className,
  isLoading = false,
}: TokenAmountInputProps) {
  const hasSelector = tokens && tokens.length > 1 && onTokenSelect

  return (
    <div className={cn('rounded-lg border border-border bg-surface-2 p-4 space-y-2', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
          {label}
        </label>
        {balance !== undefined && (
          <span className="text-xs text-muted-foreground font-data">
            Balance:{' '}
            <span className="text-foreground">{balance}</span>
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        {readonly ? (
          <div
            className={cn(
              'flex-1 font-data text-2xl font-medium text-muted-foreground truncate min-h-9 flex items-center',
              isLoading && 'skeleton-shimmer rounded h-8 w-28',
            )}
            aria-label={`${label} amount`}
          >
            {!isLoading && (value || placeholder)}
          </div>
        ) : (
          <Input
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange?.(e.target.value.replace(/[^\d.]/g, ''))}
            disabled={disabled}
            className={cn(
              'flex-1 border-0 bg-transparent p-0 h-auto text-2xl font-data font-medium',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-muted-foreground/30',
            )}
            aria-label={`${label} amount`}
          />
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {/* MAX button -- cobalt accent, action state */}
          {onMax && !readonly && !disabled && (
            <button
              type="button"
              onClick={onMax}
              className={cn(
                'h-7 px-2.5 rounded text-xs font-mono font-medium uppercase tracking-wide',
                'text-primary border border-primary/30 bg-primary/8',
                'hover:bg-primary/15 hover:border-primary/50 transition-colors duration-150 cursor-pointer',
              )}
            >
              Max
            </button>
          )}

          {/* Token selector */}
          {hasSelector ? (
            <div className="relative">
              <select
                className={cn(
                  'appearance-none cursor-pointer pl-3 pr-6 py-1.5 rounded',
                  'bg-surface-3 border border-border text-sm font-medium text-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
                  'transition-colors duration-150',
                )}
                value={token.symbol}
                onChange={e => {
                  const selected = tokens!.find(t => t.symbol === e.target.value)
                  if (selected) onTokenSelect!(selected)
                }}
                aria-label="Select token"
              >
                {tokens!.map(t => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.symbol}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded bg-surface-3 border border-border text-sm font-medium text-foreground font-mono">
              {token.symbol}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
