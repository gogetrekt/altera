"use client"

import { useState, useEffect, useMemo } from "react"
import { Wallet, TrendingUp, LayoutGrid, Droplets, ArrowUpRight, ArrowDownRight, Sparkles, Loader2 } from "lucide-react"
import { useAccount, useBalance, useReadContract, usePublicClient } from "wagmi"
import { sepolia } from "wagmi/chains"
import { formatUnits } from "viem"
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
import { Skeleton } from "@/components/ui/skeleton"
import { GenesisBadge } from "@/components/genesis-badge"
import {
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
  CORE_STAKING_ADDRESS,
  CORE_STAKING_ABI,
  NONFUNGIBLE_POSITION_MANAGER,
  POSITION_MANAGER_ABI,
  POOL_ADDRESS,
  POOL_ABI,
} from "@/lib/uniswap-config"

// Price constants (could be fetched from oracle in production)
const PRICES = {
  dETH: 2953,
  dUSDC: 1,
  CORE: 25,
}

// Pool IDs for staking
const POOL_IDS = {
  dUSDC: 0n,
  dETH: 1n,
}

// Helper: Format USD value
function formatUSD(value: number): string {
  if (value === 0) return "$0.00"
  if (value < 0.01) return "<$0.01"
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Helper: Format token amount
function formatTokenAmount(value: number, decimals: number = 4): string {
  if (value === 0) return "0"
  if (value < 0.0001) return "<0.0001"
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
}

// Helper: Format percentage
function formatPercent(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

// Helper: Time ago
function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp

  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return `${Math.floor(diff / 604800)} weeks ago`
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string
    description: string
    time: string
    status: string
    blockNumber?: bigint
  }>>([])
  const [isLoadingActivity, setIsLoadingActivity] = useState(true)

  // ============================================
  // TOKEN BALANCES
  // ============================================
  const { data: dethBalance, isLoading: dethLoading } = useBalance({
    address,
    token: TOKEN_ADDRESSES.dETH as `0x${string}`,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const { data: dusdcBalance, isLoading: dusdcLoading } = useBalance({
    address,
    token: TOKEN_ADDRESSES.dUSDC as `0x${string}`,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const { data: coreBalance, isLoading: coreLoading } = useBalance({
    address,
    token: TOKEN_ADDRESSES.CORE as `0x${string}`,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  // ============================================
  // GENESIS HOLDER CHECK (CORE balance > 0)
  // ============================================
  const isGenesisHolder = useMemo(() => {
    return coreBalance && coreBalance.value > 0n
  }, [coreBalance])

  // ============================================
  // STAKING DATA
  // ============================================
  // dUSDC Pool staking
  const { data: dusdcUserInfo, isLoading: dusdcStakeLoading } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'userInfo',
    args: address ? [POOL_IDS.dUSDC, address] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  // dETH Pool staking
  const { data: dethUserInfo, isLoading: dethStakeLoading } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'userInfo',
    args: address ? [POOL_IDS.dETH, address] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  // Pending rewards
  const { data: dusdcPendingReward } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'pendingReward',
    args: address ? [address, POOL_IDS.dUSDC] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const { data: dethPendingReward } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'pendingReward',
    args: address ? [address, POOL_IDS.dETH] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  // ============================================
  // LP POSITIONS (Uniswap V3 NFT)
  // ============================================
  const { data: lpNftBalance } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 60000, refetchInterval: 120000, enabled: !!address },
  })

  // Get first LP token ID if user has any
  const { data: lpTokenId } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: address && lpNftBalance && lpNftBalance > 0n ? [address, 0n] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address && !!lpNftBalance && lpNftBalance > 0n },
  })

  // Get LP position details
  const { data: lpPosition } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'positions',
    args: lpTokenId ? [lpTokenId] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!lpTokenId },
  })

  // Get current pool price for LP value calculation
  const { data: poolSlot0 } = useReadContract({
    address: POOL_ADDRESS as `0x${string}`,
    abi: POOL_ABI,
    functionName: 'slot0',
    chainId: sepolia.id,
  })

  const { data: token0Address } = useReadContract({
    address: POOL_ADDRESS as `0x${string}`,
    abi: POOL_ABI,
    functionName: 'token0',
    chainId: sepolia.id,
  })

  // ============================================
  // CALCULATED VALUES
  // ============================================

  // Parse staking amounts
  const dusdcStaked = dusdcUserInfo ? (dusdcUserInfo as [bigint, bigint])[0] : 0n
  const dethStaked = dethUserInfo ? (dethUserInfo as [bigint, bigint])[0] : 0n

  // Calculate current ETH price from pool
  const currentEthPrice = useMemo(() => {
    if (!poolSlot0 || !token0Address) return PRICES.dETH
    const sqrtPriceX96 = poolSlot0[0] as bigint
    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192
    const isDethToken0 = token0Address.toLowerCase() === TOKEN_ADDRESSES.dETH.toLowerCase()
    return isDethToken0 ? price * 10 ** 12 : (1 / price) * 10 ** 12
  }, [poolSlot0, token0Address])

  // Calculate LP value (simplified estimation)
  const lpValue = useMemo(() => {
    if (!lpPosition) return 0
    const liquidity = lpPosition[7] as bigint // liquidity is at index 7
    if (liquidity === 0n) return 0

    // Simplified: estimate LP value based on liquidity
    // In production, you'd calculate actual token amounts using tick math
    const liquidityNum = Number(liquidity) / 1e18
    // Rough estimation: assume balanced position
    return liquidityNum * currentEthPrice * 0.001 // Scale factor
  }, [lpPosition, currentEthPrice])

  // Total balance in USD
  const totalBalance = useMemo(() => {
    const dethValue = dethBalance ? Number(formatUnits(dethBalance.value, TOKEN_DECIMALS.dETH)) * currentEthPrice : 0
    const dusdcValue = dusdcBalance ? Number(formatUnits(dusdcBalance.value, TOKEN_DECIMALS.dUSDC)) : 0
    const coreValue = coreBalance ? Number(formatUnits(coreBalance.value, 18)) * PRICES.CORE : 0

    // Add staked amounts
    const stakedDusdcValue = Number(formatUnits(dusdcStaked, TOKEN_DECIMALS.dUSDC))
    const stakedDethValue = Number(formatUnits(dethStaked, TOKEN_DECIMALS.dETH)) * currentEthPrice

    return dethValue + dusdcValue + coreValue + stakedDusdcValue + stakedDethValue + lpValue
  }, [dethBalance, dusdcBalance, coreBalance, dusdcStaked, dethStaked, currentEthPrice, lpValue])

  // Total P&L (from staking rewards)
  const totalPnL = useMemo(() => {
    const dusdcRewardValue = dusdcPendingReward
      ? Number(formatUnits(dusdcPendingReward as bigint, 18)) * PRICES.CORE
      : 0
    const dethRewardValue = dethPendingReward
      ? Number(formatUnits(dethPendingReward as bigint, 18)) * PRICES.CORE
      : 0

    return dusdcRewardValue + dethRewardValue
  }, [dusdcPendingReward, dethPendingReward])

  // Open positions count
  const openPositions = useMemo(() => {
    let count = 0
    let profitable = 0

    if (dusdcStaked > 0n) {
      count++
      if (dusdcPendingReward && (dusdcPendingReward as bigint) > 0n) profitable++
    }

    if (dethStaked > 0n) {
      count++
      if (dethPendingReward && (dethPendingReward as bigint) > 0n) profitable++
    }

    if (lpNftBalance && lpNftBalance > 0n) {
      count += Number(lpNftBalance)
      profitable++ // Assume LP is profitable
    }

    return { count, profitable }
  }, [dusdcStaked, dethStaked, dusdcPendingReward, dethPendingReward, lpNftBalance])

  // Liquidity provided value
  const liquidityProvided = useMemo(() => {
    // Add staked tokens + LP
    const stakedDusdcValue = Number(formatUnits(dusdcStaked, TOKEN_DECIMALS.dUSDC))
    const stakedDethValue = Number(formatUnits(dethStaked, TOKEN_DECIMALS.dETH)) * currentEthPrice

    return stakedDusdcValue + stakedDethValue + lpValue
  }, [dusdcStaked, dethStaked, currentEthPrice, lpValue])

  // Portfolio items
  const portfolio = useMemo(() => {
    const items = []

    // dETH
    const dethAmount = dethBalance ? Number(formatUnits(dethBalance.value, TOKEN_DECIMALS.dETH)) : 0
    if (dethAmount > 0 || dethLoading) {
      items.push({
        token: "dETH",
        balance: formatTokenAmount(dethAmount, 4),
        value: formatUSD(dethAmount * currentEthPrice),
        rawValue: dethAmount * currentEthPrice,
        change: "+2.4%", // Hardcoded for now
      })
    }

    // dUSDC
    const dusdcAmount = dusdcBalance ? Number(formatUnits(dusdcBalance.value, TOKEN_DECIMALS.dUSDC)) : 0
    if (dusdcAmount > 0 || dusdcLoading) {
      items.push({
        token: "dUSDC",
        balance: formatTokenAmount(dusdcAmount, 2),
        value: formatUSD(dusdcAmount),
        rawValue: dusdcAmount,
        change: "0.0%",
      })
    }

    // CORE
    const coreAmount = coreBalance ? Number(formatUnits(coreBalance.value, 18)) : 0
    if (coreAmount > 0 || coreLoading) {
      items.push({
        token: "CORE",
        balance: formatTokenAmount(coreAmount, 2),
        value: formatUSD(coreAmount * PRICES.CORE),
        rawValue: coreAmount * PRICES.CORE,
        change: "+8.5%",
      })
    }

    // LP Position
    if (lpNftBalance && lpNftBalance > 0n && lpValue > 0) {
      items.push({
        token: "LP-dETH/dUSDC",
        balance: lpNftBalance.toString(),
        value: formatUSD(lpValue),
        rawValue: lpValue,
        change: "+1.2%",
      })
    }

    // Sort by value descending
    return items.sort((a, b) => b.rawValue - a.rawValue)
  }, [dethBalance, dusdcBalance, coreBalance, lpNftBalance, lpValue, currentEthPrice, dethLoading, dusdcLoading, coreLoading])

  // Active positions
  const activePositions = useMemo(() => {
    const positions = []

    // LP Position
    if (lpNftBalance && lpNftBalance > 0n && lpValue > 0) {
      positions.push({
        id: "lp-1",
        type: "LP",
        pair: "dETH/dUSDC",
        size: formatUSD(lpValue),
        pnl: "+$45.12", // Would need historical data
        pnlPercent: "+1.0%",
        isProfitable: true,
      })
    }

    // dUSDC Staking
    if (dusdcStaked > 0n) {
      const stakeValue = Number(formatUnits(dusdcStaked, TOKEN_DECIMALS.dUSDC))
      const rewardValue = dusdcPendingReward
        ? Number(formatUnits(dusdcPendingReward as bigint, 18)) * PRICES.CORE
        : 0
      const pnlPercent = stakeValue > 0 ? (rewardValue / stakeValue) * 100 : 0

      positions.push({
        id: "stake-dusdc",
        type: "Stake",
        pair: "dUSDC Pool",
        size: formatUSD(stakeValue),
        pnl: `+${formatUSD(rewardValue)}`,
        pnlPercent: formatPercent(pnlPercent),
        isProfitable: rewardValue > 0,
      })
    }

    // dETH Staking
    if (dethStaked > 0n) {
      const stakeValue = Number(formatUnits(dethStaked, TOKEN_DECIMALS.dETH)) * currentEthPrice
      const rewardValue = dethPendingReward
        ? Number(formatUnits(dethPendingReward as bigint, 18)) * PRICES.CORE
        : 0
      const pnlPercent = stakeValue > 0 ? (rewardValue / stakeValue) * 100 : 0

      positions.push({
        id: "stake-deth",
        type: "Stake",
        pair: "dETH Pool",
        size: formatUSD(stakeValue),
        pnl: `+${formatUSD(rewardValue)}`,
        pnlPercent: formatPercent(pnlPercent),
        isProfitable: rewardValue > 0,
      })
    }

    return positions
  }, [dusdcStaked, dethStaked, dusdcPendingReward, dethPendingReward, lpNftBalance, lpValue, currentEthPrice])

  // Fetch recent activity from blockchain events
  useEffect(() => {
    async function fetchRecentActivity() {
      if (!publicClient || !address) {
        setRecentActivity([])
        setIsLoadingActivity(false)
        return
      }

      setIsLoadingActivity(true)

      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock - 10000n // Last ~10000 blocks

        // Fetch Staked events
        const stakedLogs = await publicClient.getLogs({
          address: CORE_STAKING_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Staked',
            inputs: [
              { type: 'address', name: 'user', indexed: true },
              { type: 'uint256', name: 'poolId', indexed: true },
              { type: 'uint256', name: 'amount', indexed: false },
            ],
          },
          args: { user: address },
          fromBlock,
          toBlock: currentBlock,
        })

        // Fetch Unstaked events
        const unstakedLogs = await publicClient.getLogs({
          address: CORE_STAKING_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Unstaked',
            inputs: [
              { type: 'address', name: 'user', indexed: true },
              { type: 'uint256', name: 'poolId', indexed: true },
              { type: 'uint256', name: 'amount', indexed: false },
            ],
          },
          args: { user: address },
          fromBlock,
          toBlock: currentBlock,
        })

        // Fetch Claimed events
        const claimedLogs = await publicClient.getLogs({
          address: CORE_STAKING_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Claimed',
            inputs: [
              { type: 'address', name: 'user', indexed: true },
              { type: 'uint256', name: 'poolId', indexed: true },
              { type: 'uint256', name: 'amount', indexed: false },
            ],
          },
          args: { user: address },
          fromBlock,
          toBlock: currentBlock,
        })

        // Combine and format all events
        const activities: Array<{
          type: string
          description: string
          time: string
          status: string
          blockNumber: bigint
        }> = []

        // Process staked events
        for (const log of stakedLogs) {
          const poolId = log.args.poolId as bigint
          const amount = log.args.amount as bigint
          const isUSDC = poolId === 0n
          const decimals = isUSDC ? TOKEN_DECIMALS.dUSDC : TOKEN_DECIMALS.dETH
          const symbol = isUSDC ? "dUSDC" : "dETH"
          const formattedAmount = Number(formatUnits(amount, decimals)).toFixed(isUSDC ? 2 : 4)

          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })

          activities.push({
            type: "Stake",
            description: `${formattedAmount} ${symbol} staked`,
            time: getTimeAgo(Number(block.timestamp)),
            status: "success",
            blockNumber: log.blockNumber,
          })
        }

        // Process unstaked events
        for (const log of unstakedLogs) {
          const poolId = log.args.poolId as bigint
          const amount = log.args.amount as bigint
          const isUSDC = poolId === 0n
          const decimals = isUSDC ? TOKEN_DECIMALS.dUSDC : TOKEN_DECIMALS.dETH
          const symbol = isUSDC ? "dUSDC" : "dETH"
          const formattedAmount = Number(formatUnits(amount, decimals)).toFixed(isUSDC ? 2 : 4)

          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })

          activities.push({
            type: "Unstake",
            description: `${formattedAmount} ${symbol} unstaked`,
            time: getTimeAgo(Number(block.timestamp)),
            status: "success",
            blockNumber: log.blockNumber,
          })
        }

        // Process claimed events
        for (const log of claimedLogs) {
          const amount = log.args.amount as bigint
          const formattedAmount = Number(formatUnits(amount, 18)).toFixed(4)

          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })

          activities.push({
            type: "Claim",
            description: `${formattedAmount} CORE claimed`,
            time: getTimeAgo(Number(block.timestamp)),
            status: "success",
            blockNumber: log.blockNumber,
          })
        }

        // Sort by block number (most recent first) and take top 10
        activities.sort((a, b) => Number(b.blockNumber - a.blockNumber))
        setRecentActivity(activities.slice(0, 10))
      } catch (error) {
        console.error("Error fetching activity:", error)
        setRecentActivity([])
      } finally {
        setIsLoadingActivity(false)
      }
    }

    fetchRecentActivity()
  }, [publicClient, address])

  // Loading state
  const isLoading = dethLoading || dusdcLoading || coreLoading || dusdcStakeLoading || dethStakeLoading

  // Summary cards with real data
  const summaryCards = [
    {
      title: "Total Balance",
      value: isConnected ? formatUSD(totalBalance) : "$0.00",
      change: "+5.2%", // Would need historical data
      positive: true,
      icon: Wallet,
    },
    {
      title: "Total P&L",
      value: isConnected ? (totalPnL > 0 ? `+${formatUSD(totalPnL)}` : formatUSD(totalPnL)) : "$0.00",
      change: totalPnL > 0 ? formatPercent((totalPnL / Math.max(totalBalance, 1)) * 100) : "0%",
      positive: totalPnL >= 0,
      icon: TrendingUp,
    },
    {
      title: "Open Positions",
      value: isConnected ? openPositions.count.toString() : "0",
      change: isConnected && openPositions.profitable > 0
        ? `${openPositions.profitable} profitable`
        : "0 profitable",
      positive: openPositions.profitable > 0,
      icon: LayoutGrid,
    },
    {
      title: "Liquidity Provided",
      value: isConnected ? formatUSD(liquidityProvided) : "$0.00",
      change: `+${formatUSD(totalPnL)} rewards`,
      positive: true,
      icon: Droplets,
    },
  ]

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                {isConnected ? "Overview of your DeFi portfolio" : "Connect wallet to view your portfolio"}
              </p>
            </div>
            {isConnected && (
              isGenesisHolder ? (
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
              ) : (
                <div
                  className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border/50 opacity-60"
                  title="You don't own a Genesis Pass yet"
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Not a Genesis Holder</span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-popover border border-border text-xs text-muted-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    Mint a Genesis Pass to become an early supporter
                  </div>
                </div>
              )
            )}
            {/* Genesis Badge - checks real NFT ownership on Base */}
            <GenesisBadge />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((card) => (
              <Card key={card.title} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <card.icon className="h-5 w-5 text-muted-foreground" />
                    {isLoading ? (
                      <Skeleton className="h-5 w-16" />
                    ) : (
                      <Badge
                        variant="secondary"
                        className={card.positive ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"}
                      >
                        {card.change}
                      </Badge>
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-32 mb-1" />
                  ) : (
                    <p className="text-2xl font-bold">{card.value}</p>
                  )}
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
                {!isConnected ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Connect wallet to view portfolio
                  </div>
                ) : isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="space-y-2 text-right">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : portfolio.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tokens found. Get some from the Faucet!
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Recent Activity Card */}
            <Card className="bg-card border-border lg:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Connect wallet to view activity
                  </div>
                ) : isLoadingActivity ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <Skeleton className="h-2 w-2 rounded-full mt-2" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Active Positions Card */}
            <Card className="bg-card border-border lg:col-span-1">
              <CardHeader>
                <CardTitle>Active Positions</CardTitle>
                <CardDescription>Your open positions</CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Connect wallet to view positions
                  </div>
                ) : isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : activePositions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active positions
                  </div>
                ) : (
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
                              {position.isProfitable ? (
                                <ArrowUpRight className="h-3 w-3 text-green-500" />
                              ) : (
                                <ArrowDownRight className="h-3 w-3 text-red-500" />
                              )}
                              <span className={position.isProfitable ? "text-green-500" : "text-red-500"}>
                                {position.pnlPercent}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
