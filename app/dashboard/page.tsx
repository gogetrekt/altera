"use client"

import { useState, useEffect } from "react"
import { Wallet, TrendingUp, LayoutGrid, Droplets, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

const summaryCards = [
  {
    title: "Total Balance",
    value: "$12,543.21",
    change: "+5.2%",
    positive: true,
    icon: Wallet,
  },
  {
    title: "Total P&L",
    value: "+$1,234.56",
    change: "+12.4%",
    positive: true,
    icon: TrendingUp,
  },
  {
    title: "Open Positions",
    value: "3",
    change: "2 profitable",
    positive: true,
    icon: LayoutGrid,
  },
  {
    title: "Liquidity Provided",
    value: "$4,521.32",
    change: "+$45.12 fees",
    positive: true,
    icon: Droplets,
  },
]

const portfolio = [
  { token: "ETH", balance: "1.2345", value: "$3,086.25", change: "+2.4%" },
  { token: "USDC", balance: "5,432.10", value: "$5,432.10", change: "0.0%" },
  { token: "CORE", balance: "10,000.00", value: "$2,500.00", change: "+8.5%" },
  { token: "LP-ETH/USDC", balance: "0.45", value: "$1,524.86", change: "+1.2%" },
]

const recentActivity = [
  { type: "Swap", description: "0.5 ETH → 1,250 USDC", time: "2 min ago", status: "success" },
  { type: "Stake", description: "1,000 USDC staked", time: "1 hour ago", status: "success" },
  { type: "Add Liquidity", description: "ETH/USDC Pool", time: "3 hours ago", status: "success" },
  { type: "Claim", description: "25.5 CORE claimed", time: "1 day ago", status: "success" },
  { type: "Bridge", description: "0.2 ETH to Arbitrum", time: "2 days ago", status: "success" },
]

const activePositions = [
  {
    id: "1",
    type: "LP",
    pair: "ETH/USDC",
    size: "$4,521.32",
    pnl: "+$45.12",
    pnlPercent: "+1.0%",
    status: "active",
  },
  {
    id: "2",
    type: "Stake",
    pair: "USDC Pool",
    size: "$1,000.00",
    pnl: "+$25.50",
    pnlPercent: "+2.55%",
    status: "active",
  },
  {
    id: "3",
    type: "Stake",
    pair: "ETH Pool",
    size: "$1,250.00",
    pnl: "+$12.25",
    pnlPercent: "+0.98%",
    status: "active",
  },
]

export default function DashboardPage() {
  const [isGenesisHolder, setIsGenesisHolder] = useState(false)

  useEffect(() => {
    const genesisStatus = localStorage.getItem("altera_genesis_holder")
    if (genesisStatus === "true") {
      setIsGenesisHolder(true)
    }
  }, [])

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of your DeFi portfolio</p>
            </div>
            {isGenesisHolder && (
              <div
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                title="Genesis Pass holder — early supporter of Altera"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Genesis Holder</span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-popover border border-border text-xs text-muted-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  Genesis Pass holder — early supporter of Altera
                </div>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card) => (
              <Card key={card.title} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <card.icon className="h-5 w-5 text-muted-foreground" />
                    <Badge
                      variant="secondary"
                      className={card.positive ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}
                    >
                      {card.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Card */}
            <Card className="bg-card border-border lg:col-span-1">
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Your token balances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.map((item) => (
                    <div key={item.token} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-medium">{item.token}</p>
                        <p className="text-sm text-muted-foreground">{item.balance}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{item.value}</p>
                        <p className={`text-sm ${item.change.startsWith("+") ? "text-green-500" : item.change.startsWith("-") ? "text-red-500" : "text-muted-foreground"}`}>
                          {item.change}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="bg-card border-border lg:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                        <div className={`mt-1 h-2 w-2 rounded-full ${activity.status === "success" ? "bg-green-500" : "bg-yellow-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{activity.type}</p>
                          <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Active Positions Card */}
            <Card className="bg-card border-border lg:col-span-1">
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>Your open positions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePositions.map((position) => (
                      <TableRow key={position.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{position.type}</p>
                            <p className="text-xs text-muted-foreground">{position.pair}</p>
                          </div>
                        </TableCell>
                        <TableCell>{position.size}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {position.pnl.startsWith("+") ? (
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3 text-red-500" />
                            )}
                            <span className={position.pnl.startsWith("+") ? "text-green-500" : "text-red-500"}>
                              {position.pnlPercent}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
