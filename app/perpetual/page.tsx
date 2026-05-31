import { PageLayout } from '@/components/page-layout'
import { SimulationBanner } from '@/components/ui/simulation-banner'
import { StatusBadge } from '@/components/ui/status-badge'
import { SectionHeader } from '@/components/ui/section-header'
import { EmptyState } from '@/components/ui/empty-state'
import { PerpetualOrderPanel } from '@/components/perpetual-order-panel'
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Clock,
} from 'lucide-react'

// ─── Static demo market data (clearly labelled as demo) ───────────────────────

const DEMO_MARKET = {
  pair: 'ETH-PERP',
  price: '2,534.82',
  change: '+2.47%',
  changePositive: true,
  high24h: '2,589.14',
  low24h: '2,478.53',
  volume24h: '1.24B',
  openInterest: '847.3M',
} as const

// ─── Market stat cell ─────────────────────────────────────────────────────────

function MarketStat({
  label,
  value,
  positive,
}: {
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wide">
        {label}
      </span>
      <span
        className={
          positive === undefined
            ? 'text-sm font-data font-medium text-foreground'
            : positive
            ? 'text-sm font-data font-medium text-emerald-400'
            : 'text-sm font-data font-medium text-red-400'
        }
      >
        {value}
      </span>
    </div>
  )
}

// ─── Chart placeholder ────────────────────────────────────────────────────────

function ChartPlaceholder() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-sm font-medium text-foreground">Price Chart</span>
          <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-wide">(Demo)</span>
        </div>
        <StatusBadge variant="phase-2" label="Phase 2" />
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
        {/* Decorative fake chart bars */}
        <div className="flex items-end gap-1 h-12 opacity-20" aria-hidden="true">
          {[40, 65, 30, 80, 55, 70, 45, 90, 60, 75, 50, 85, 35, 95, 62].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-sm bg-zinc-500"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-zinc-400">
            TradingView chart integration
          </p>
          <p className="text-xs text-zinc-600">Available when perpetual trading ships in Phase 2</p>
        </div>
        <div className="flex items-center gap-1.5 rounded px-2.5 py-1 bg-zinc-800/60 border border-zinc-700/40">
          <Clock className="h-3 w-3 text-zinc-500" strokeWidth={1.5} />
          <span className="text-[11px] font-mono text-zinc-500">Phase 2</span>
        </div>
      </div>
    </div>
  )
}

// ─── Positions / Orders table (empty, coming soon) ────────────────────────────

function PositionsTable({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>
      <EmptyState
        variant="coming-soon"
        title="No data"
        description={`${title} will appear here when perpetual trading is live.`}
        className="py-8"
      />
    </div>
  )
}

// ─── Page (Server Component -- SimulationBanner cannot be toggled off) ────────

export default function PerpetualPage() {
  return (
    <PageLayout minimalFooter>
      <div className="py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-4">

          {/* ── Mandatory simulation disclaimer -- rendered server-side ── */}
          <SimulationBanner />

          {/* ── Phase 2 notice ── */}
          <div className="flex items-start gap-3 rounded-md border border-zinc-700/50 bg-zinc-800/30 px-4 py-3">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" strokeWidth={1.5} />
            <p className="text-sm text-zinc-400">
              <strong className="text-zinc-300 font-medium">Phase 2 feature.</strong>{' '}
              Perpetual trading is not available in the current release.
              The interface below is a non-functional preview. No orders can be placed.
            </p>
          </div>

          {/* ── Page header ── */}
          <div className="flex items-center gap-3">
            <SectionHeader title="Perpetual Trading" as="h1" />
            <StatusBadge variant="simulation" />
          </div>

          {/* ── Market strip ── */}
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              {/* Pair + price */}
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono text-sm font-medium text-zinc-400 tracking-wide">
                  {DEMO_MARKET.pair}
                  <span className="ml-2 text-[11px] text-zinc-600">(Demo)</span>
                </span>
                <span className="font-data text-2xl font-semibold text-foreground">
                  ${DEMO_MARKET.price}
                </span>
                <span
                  className={`flex items-center gap-1 text-sm font-data font-medium ${
                    DEMO_MARKET.changePositive ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {DEMO_MARKET.changePositive
                    ? <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                    : <TrendingDown className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  {DEMO_MARKET.change}
                </span>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 ml-auto">
                <MarketStat label="24h High" value={`$${DEMO_MARKET.high24h}`} positive={true} />
                <MarketStat label="24h Low" value={`$${DEMO_MARKET.low24h}`} positive={false} />
                <MarketStat label="24h Volume" value={`$${DEMO_MARKET.volume24h}`} />
                <MarketStat label="Open Interest" value={`$${DEMO_MARKET.openInterest}`} />
              </div>
            </div>
          </div>

          {/* ── Main content grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Left: chart + tables */}
            <div className="lg:col-span-2 space-y-4">
              <ChartPlaceholder />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PositionsTable title="Open Positions" />
                <PositionsTable title="Open Orders" />
              </div>
            </div>

            {/* Right: order panel (disabled) */}
            <div className="lg:col-span-1">
              <PerpetualOrderPanel />
            </div>
          </div>

          {/* ── Disclaimer footer strip ── */}
          <div className="rounded-md border border-yellow-500/20 bg-yellow-500/3 px-4 py-3">
            <p className="text-xs text-yellow-600 leading-relaxed">
              All prices, positions, P&amp;L, and market data shown on this page are for
              demonstration purposes only. They do not represent real market conditions,
              real trades, or any financial activity. No real funds are involved.
              Perpetual trading is a planned Phase 2 feature and is not currently available.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
