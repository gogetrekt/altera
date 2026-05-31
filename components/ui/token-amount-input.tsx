'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TokenOption {
  symbol: string
  name: string
  address?: string
}

interface TokenAmountInputProps {
  /** Field label: "From", "To", "Amount" */
  label: string
  value: string
  onChange?: (value: string) => void
  /** Formatted balance string e.g. "1.2345" */
  balance?: string
  /** Currently selected token */
  token: TokenOption
  /** Available tokens for the selector dropdown */
  tokens?: TokenOption[]
  onTokenSelect?: (token: TokenOption) => void
  onMax?: () => void
  /** When true, input is not editable (to-field in swap) */
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  /** When true, shows skeleton loaders */
  isLoading?: boolean
}

/**
 * Composable token amount input with symbol selector, balance display, and MAX.
 * All numeric values displayed with font-data (monospace tabular).
 * Label always sits above input -- no placeholder-as-label pattern.
 */
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
    <div className={cn('rounded-md border border-border bg-secondary/40 p-3 space-y-2', className)}>
      {/* Top row: label + balance */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground font-medium">{label}</label>
        {balance !== undefined && (
          <span className="text-xs text-muted-foreground font-data">
            Balance: <span className="text-foreground">{balance}</span>
          </span>
        )}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        {readonly ? (
          <div
            className={cn(
              'flex-1 font-data text-xl font-medium text-muted-foreground truncate min-h-[36px] flex items-center',
              isLoading && 'skeleton-shimmer rounded h-7 w-24',
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
              'flex-1 border-0 bg-transparent p-0 h-auto text-xl font-data font-medium',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-muted-foreground/40',
            )}
            aria-label={`${label} amount`}
          />
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Max button */}
          {onMax && !readonly && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onMax}
              className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 cursor-pointer"
            >
              Max
            </Button>
          )}

          {/* Token selector or static token badge */}
          {hasSelector ? (
            <div className="relative">
              <select
                className={cn(
                  'appearance-none cursor-pointer pl-3 pr-6 py-1.5 rounded',
                  'bg-zinc-800/80 border border-zinc-700/60 text-sm font-medium text-foreground',
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
            <span className="inline-flex items-center px-3 py-1.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-sm font-medium text-foreground">
              {token.symbol}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
