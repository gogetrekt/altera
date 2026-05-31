import { PageLayout } from '@/components/page-layout'
import { StatusBadge } from '@/components/ui/status-badge'
import { SectionHeader } from '@/components/ui/section-header'
import {
  Clock,
  ArrowLeftRight,
  Shield,
  Zap,
  Globe,
} from 'lucide-react'

// ─── What to expect when bridge ships ────────────────────────────────────────

const upcomingFeatures = [
  {
    icon: ArrowLeftRight,
    label: 'Cross-chain transfers',
    description:
      'Move tokens between Sepolia, Base, Arbitrum, and Optimism from a single interface.',
  },
  {
    icon: Shield,
    label: 'Slippage protection',
    description: 'Configurable slippage tolerance and minimum received enforcement on all bridge routes.',
  },
  {
    icon: Zap,
    label: 'Optimistic bridging',
    description: 'Fast-path bridging for supported token pairs with on-chain finality confirmation.',
  },
  {
    icon: Globe,
    label: 'Multi-network routing',
    description: 'Automatic route selection to minimise bridge fees across connected networks.',
  },
]

// ─── Mock route card (visual only, fully disabled) ────────────────────────────

function DisabledRouteCard() {
  return (
    <div className="rounded-xl border border-border bg-card opacity-40 select-none pointer-events-none" aria-hidden="true">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Bridge</span>
        <span className="text-xs font-mono text-muted-foreground">Route unavailable</span>
      </div>
      <div className="px-5 py-5 space-y-4">
        {/* From */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">From</p>
          <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-zinc-700" />
              <span className="text-sm text-muted-foreground">Sepolia</span>
            </div>
            <span className="text-sm font-data text-muted-foreground">0.00</span>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary">
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>

        {/* To */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium">To</p>
          <div className="flex items-center justify-between rounded-md border border-border bg-secondary/40 px-3 py-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-zinc-700" />
              <span className="text-sm text-muted-foreground">Base Sepolia</span>
            </div>
            <span className="text-sm font-data text-muted-foreground">0.00</span>
          </div>
        </div>

        {/* Disabled button */}
        <div className="h-11 rounded-md bg-zinc-800 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 text-zinc-600" strokeWidth={1.5} />
          <span className="text-sm text-zinc-600 font-medium">Coming in Phase 2</span>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BridgePage() {
  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">

          {/* ── Header ── */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <SectionHeader title="Bridge" as="h1" />
              <StatusBadge variant="phase-2" />
            </div>
            <p className="text-sm text-muted-foreground max-w-[55ch] leading-relaxed">
              Cross-chain bridging is not available in the current release.
              This is a Phase 2 feature. No bridging is possible at this time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* ══ Left: disabled interface preview ════════════════════════════ */}
            <div className="space-y-4">
              {/* Phase 2 notice */}
              <div className="flex items-start gap-3 rounded-md border border-zinc-700/50 bg-zinc-800/30 px-4 py-3">
                <Clock className="h-4 w-4 shrink-0 mt-0.5 text-zinc-500" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-zinc-300">Phase 2 feature</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                    Bridge will be enabled in a future release. The interface below is a
                    non-functional preview. No transactions can be submitted.
                  </p>
                </div>
              </div>

              <DisabledRouteCard />
            </div>

            {/* ══ Right: what to expect ════════════════════════════════════════ */}
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground mb-1">
                  What to expect in Phase 2
                </h2>
                <p className="text-xs text-muted-foreground">
                  The bridge will support the following when it ships.
                </p>
              </div>

              <div className="space-y-3">
                {upcomingFeatures.map(feature => (
                  <div
                    key={feature.label}
                    className="flex items-start gap-3 rounded-md border border-border/50 bg-card/40 px-4 py-3"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded bg-zinc-800 border border-zinc-700/50">
                      <feature.icon className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{feature.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Supported networks grid */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 mb-3">
                  Planned networks
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['Sepolia', 'Base Sepolia', 'Arbitrum Sepolia', 'Optimism Sepolia'].map(net => (
                    <div
                      key={net}
                      className="flex items-center gap-2 rounded-md border border-border/40 bg-card/30 px-3 py-2"
                    >
                      <div className="h-2 w-2 rounded-full bg-zinc-700" />
                      <span className="text-xs text-muted-foreground">{net}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
