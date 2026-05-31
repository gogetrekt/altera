'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Perpetual order panel -- fully disabled, simulation-only.
 * All inputs are non-interactive. No transactions can be submitted.
 * Required by audit remediation: disabled features must look non-functional.
 */
export function PerpetualOrderPanel() {
  const [side, setSide] = useState<'long' | 'short'>('long')
  const [leverage, setLeverage] = useState(5)

  const DEMO_PRICE = '2,534.82'

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="text-sm font-medium text-foreground">Place Order</h2>
        <div className="flex items-center gap-1.5 rounded px-2 py-1 bg-zinc-800/60 border border-zinc-700/40">
          <Clock className="h-3 w-3 text-zinc-500" strokeWidth={1.5} />
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
            Phase 2
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-5">
        {/* Long / Short selector */}
        <div
          className="grid grid-cols-2 gap-1.5 rounded-md bg-zinc-900/60 border border-border p-1"
          aria-label="Order side (disabled)"
        >
          {(['long', 'short'] as const).map(s => (
            <button
              key={s}
              type="button"
              disabled
              aria-disabled="true"
              onClick={() => setSide(s)}
              className={cn(
                'flex items-center justify-center gap-2 rounded py-2 text-sm font-medium',
                'transition-colors duration-150 cursor-not-allowed',
                side === s && s === 'long'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : side === s && s === 'short'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/25'
                  : 'text-muted-foreground',
              )}
            >
              {s === 'long'
                ? <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
                : <TrendingDown className="h-4 w-4" strokeWidth={1.5} />}
              {s === 'long' ? 'Long' : 'Short'}
            </button>
          ))}
        </div>

        {/* Size input (disabled) */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">
            Size (USDC)
          </label>
          <div className="flex items-center rounded-md border border-border bg-secondary/40 px-3 py-2.5">
            <span className="flex-1 font-data text-sm text-muted-foreground/40">0.00</span>
            <span className="text-xs text-zinc-600 font-mono">disabled</span>
          </div>
        </div>

        {/* Leverage slider (disabled) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground font-medium">Leverage</label>
            <span className="font-data text-sm font-medium text-muted-foreground/50">
              {leverage}x
            </span>
          </div>
          <div className="relative h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-zinc-700"
              style={{ width: `${((leverage - 1) / 19) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-muted-foreground/40">
            <span>1x</span>
            <span>20x</span>
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-md border border-border/60 bg-zinc-900/40 px-4 py-3 space-y-2.5">
          {[
            { label: 'Entry Price', value: `$${DEMO_PRICE}` },
            { label: 'Liquidation Price', value: '--' },
            { label: 'Position Size', value: '--' },
            { label: 'Fee', value: '0.10%' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-xs font-data text-muted-foreground/50">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Disabled action button */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={cn(
            'w-full h-11 rounded-md text-sm font-semibold',
            'inline-flex items-center justify-center gap-2',
            'cursor-not-allowed',
            side === 'long'
              ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/15'
              : 'bg-red-500/10 text-red-700 border border-red-500/15',
          )}
        >
          <Clock className="h-4 w-4" strokeWidth={1.5} />
          {side === 'long' ? 'Open Long' : 'Open Short'} -- Phase 2
        </button>

        {/* Simulation label */}
        <p className="text-center text-[11px] text-zinc-600 font-mono leading-relaxed">
          Simulated trading only. No real funds involved.
          Trading available in Phase 2.
        </p>
      </div>
    </div>
  )
}
