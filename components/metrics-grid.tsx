import React from "react"
import { Activity, BarChart3, Coins, Globe, Layers, Users } from "lucide-react"

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  change?: string
}

function MetricCard({ label, value, icon, change }: MetricCardProps) {
  return (
    <div className="group rounded-lg border border-border bg-surface-1 hover:border-border-strong hover:bg-surface-2 transition-all duration-200 p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60">{label}</p>
          <p className="text-2xl sm:text-3xl font-data font-semibold text-foreground">{value}</p>
          {change && (
            <p className="text-xs font-mono text-primary">{change}</p>
          )}
        </div>
        <div className="p-2 rounded-md bg-surface-3 border border-border text-muted-foreground group-hover:text-primary group-hover:border-primary/20 group-hover:bg-primary/8 transition-colors">
          {icon}
        </div>
      </div>
    </div>
  )
}

const metrics: MetricCardProps[] = [
  {
    label: "Total Value Locked",
    value: "$124.5M",
    icon: <Coins className="h-5 w-5" />,
    change: "+12.4% this week",
  },
  {
    label: "Total Volume (24h)",
    value: "$8.2M",
    icon: <BarChart3 className="h-5 w-5" />,
    change: "+5.7% vs yesterday",
  },
  {
    label: "Active Pools",
    value: "156",
    icon: <Layers className="h-5 w-5" />,
  },
  {
    label: "Active Users",
    value: "12,847",
    icon: <Users className="h-5 w-5" />,
    change: "+324 today",
  },
  {
    label: "Supported Assets",
    value: "48",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    label: "Network",
    value: "Ethereum Sepolia",
    icon: <Globe className="h-5 w-5" />,
  },
]

export function MetricsGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>
    </section>
  )
}
