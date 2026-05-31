"use client"

import { useState, useEffect, useMemo } from "react"
import { Wallet, TrendingUp, LayoutGrid, Droplets, ArrowUpRight, ArrowDownRight, Sparkles, Loader2 } from "lucide-react"
import { useAccount, useBalance, useReadContract, usePublicClient } from "wagmi"
import { sepolia } from "wagmi/chains"
import { formatUnits } from "viem"
import { PageLayout } from "@/components/page-layout"
import { GenesisBadge } from "@/components/genesis-badge"
import { SectionHeader } from "@/components/ui/section-header"
import { cn } from "@/lib/utils"
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

const PRICES = { dETH: 2953, dUSDC: 1, CORE: 25 }
const POOL_IDS = { dUSDC: 0n, dETH: 1n }

function formatUSD(value: number): string {
  if (value === 0) return "$0.00"
  if (value < 0.01) return "<$0.01"
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatTokenAmount(value: number, decimals: number = 4): string {
  if (value === 0) return "0"
  if (value < 0.0001) return "<0.0001"
  return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })
}

function formatPercent(value: number, showSign: boolean = true): string {
  const sign = showSign && value > 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const diff = now - timestamp
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`
  return `${Math.floor(diff / 604800)} weeks ago`
}

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("rounded bg-surface-3 animate-pulse", className)} />
  )
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

  // TOKEN BALANCES
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

  const isGenesisHolder = useMemo(() => {
    return coreBalance && coreBalance.value > 0n
  }, [coreBalance])

  // STAKING DATA
  const { data: dusdcUserInfo, isLoading: dusdcStakeLoading } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'userInfo',
    args: address ? [POOL_IDS.dUSDC, address] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const { data: dethUserInfo, isLoading: dethStakeLoading } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'userInfo',
    args: address ? [POOL_IDS.dETH, address] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

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

  // LP POSITIONS
  const { data: lpNftBalance } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: { staleTime: 60000, refetchInterval: 120000, enabled: !!address },
  })

  const { data: lpTokenId } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'tokenOfOwnerByIndex',
    args: address && lpNftBalance && lpNftBalance > 0n ? [address, 0n] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address && !!lpNftBalance && lpNftBalance > 0n },
  })

  const { data: lpPosition } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'positions',
    args: lpTokenId ? [lpTokenId] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!lpTokenId },
  })

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

  // CALCULATED VALUES
  const dusdcStaked = dusdcUserInfo ? (dusdcUserInfo as [bigint, bigint])[0] : 0n
  const dethStaked = dethUserInfo ? (dethUserInfo as [bigint, bigint])[0] : 0n

  const currentEthPrice = useMemo(() => {
    if (!poolSlot0 || !token0Address) return PRICES.dETH
    const sqrtPriceX96 = poolSlot0[0] as bigint
    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192
    const isDethToken0 = token0Address.toLowerCase() === TOKEN_ADDRESSES.dETH.toLowerCase()
    return isDethToken0 ? price * 10 ** 12 : (1 / price) * 10 ** 12
  }, [poolSlot0, token0Address])

  const lpValue = useMemo(() => {
    if (!lpPosition) return 0
    const liquidity = lpPosition[7] as bigint
    if (liquidity === 0n) return 0
    const liquidityNum = Number(liquidity) / 1e18
    return liquidityNum * currentEthPrice * 0.001
  }, [lpPosition, currentEthPrice])

  const totalBalance = useMemo(() => {
    const dethValue = dethBalance ? Number(formatUnits(dethBalance.value, TOKEN_DECIMALS.dETH)) * currentEthPrice : 0
    const dusdcValue = dusdcBalance ? Number(formatUnits(dusdcBalance.value, TOKEN_DECIMALS.dUSDC)) : 0
    const coreValue = coreBalance ? Number(formatUnits(coreBalance.value, 18)) * PRICES.CORE : 0
    const stakedDusdcValue = Number(formatUnits(dusdcStaked, TOKEN_DECIMALS.dUSDC))
    const stakedDethValue = Number(formatUnits(dethStaked, TOKEN_DECIMALS.dETH)) * currentEthPrice
    return dethValue + dusdcValue + coreValue + stakedDusdcValue + stakedDethValue + lpValue
  }, [dethBalance, dusdcBalance, coreBalance, dusdcStaked, dethStaked, currentEthPrice, lpValue])

  const totalPnL = useMemo(() => {
    const dusdcRewardValue = dusdcPendingReward ? Number(formatUnits(dusdcPendingReward as bigint, 18)) * PRICES.CORE : 0
    const dethRewardValue = dethPendingReward ? Number(formatUnits(dethPendingReward as bigint, 18)) * PRICES.CORE : 0
    return dusdcRewardValue + dethRewardValue
  }, [dusdcPendingReward, dethPendingReward])

  const openPositions = useMemo(() => {
    let count = 0, profitable = 0
    if (dusdcStaked > 0n) { count++; if (dusdcPendingReward && (dusdcPendingReward as bigint) > 0n) profitable++ }
    if (dethStaked > 0n) { count++; if (dethPendingReward && (dethPendingReward as bigint) > 0n) profitable++ }
    if (lpNftBalance && lpNftBalance > 0n) { count += Number(lpNftBalance); profitable++ }
    return { count, profitable }
  }, [dusdcStaked, dethStaked, dusdcPendingReward, dethPendingReward, lpNftBalance])

  const liquidityProvided = useMemo(() => {
    const stakedDusdcValue = Number(formatUnits(dusdcStaked, TOKEN_DECIMALS.dUSDC))
    const stakedDethValue = Number(formatUnits(dethStaked, TOKEN_DECIMALS.dETH)) * currentEthPrice
    return stakedDusdcValue + stakedDethValue + lpValue
  }, [dusdcStaked, dethStaked, currentEthPrice, lpValue])

  const portfolio = useMemo(() => {
    const items = []
    const dethAmount = dethBalance ? Number(formatUnits(dethBalance.value, TOKEN_DECIMALS.dETH)) : 0
    if (dethAmount > 0 || dethLoading) items.push({ token: "dETH", balance: formatTokenAmount(dethAmount, 4), value: formatUSD(dethAmount * currentEthPrice), rawValue: dethAmount * currentEthPrice, change: "+2.4%", positive: true })
    const dusdcAmount = dusdcBalance ? Number(formatUnits(dusdcBalance.value, TOKEN_DECIMALS.dUSDC)) : 0
    if (dusdcAmount > 0 || dusdcLoading) items.push({ token: "dUSDC", balance: formatTokenAmount(dusdcAmount, 2), value: formatUSD(dusdcAmount), rawValue: dusdcAmount, change: "0.0%", positive: null })
    const coreAmount = coreBalance ? Number(formatUnits(coreBalance.value, 18)) : 0
    if (coreAmount > 0 || coreLoading) items.push({ token: "CORE", balance: formatTokenAmount(coreAmount, 2), value: formatUSD(coreAmount * PRICES.CORE), rawValue: coreAmount * PRICES.CORE, change: "+8.5%", positive: true })
    if (lpNftBalance && lpNftBalance > 0n && lpValue > 0) items.push({ token: "LP-dETH/dUSDC", balance: lpNftBalance.toString(), value: formatUSD(lpValue), rawValue: lpValue, change: "+1.2%", positive: true })
    return items.sort((a, b) => b.rawValue - a.rawValue)
  }, [dethBalance, dusdcBalance, coreBalance, lpNftBalance, lpValue, currentEthPrice, dethLoading, dusdcLoading, coreLoading])

  const activePositions = useMemo(() => {
    const positions = []
    if (lpNftBalance && lpNftBalance > 0n && lpValue > 0) positions.push({ id: "lp-1", type: "LP", pair: "dETH/dUSDC", size: formatUSD(lpValue), pnlPercent: "+1.0%", isProfitable: true })
    if (dusdcStaked > 0n) {
      const stakeValue = Number(formatUnits(dusdcStaked, TOKEN_DECIMALS.dUSDC))
      const rewardValue = dusdcPendingReward ? Number(formatUnits(dusdcPendingReward as bigint, 18)) * PRICES.CORE : 0
      const pnlPercent = stakeValue > 0 ? (rewardValue / stakeValue) * 100 : 0
      positions.push({ id: "stake-dusdc", type: "Stake", pair: "dUSDC Pool", size: formatUSD(stakeValue), pnlPercent: formatPercent(pnlPercent), isProfitable: rewardValue > 0 })
    }
    if (dethStaked > 0n) {
      const stakeValue = Number(formatUnits(dethStaked, TOKEN_DECIMALS.dETH)) * currentEthPrice
      const rewardValue = dethPendingReward ? Number(formatUnits(dethPendingReward as bigint, 18)) * PRICES.CORE : 0
      const pnlPercent = stakeValue > 0 ? (rewardValue / stakeValue) * 100 : 0
      positions.push({ id: "stake-deth", type: "Stake", pair: "dETH Pool", size: formatUSD(stakeValue), pnlPercent: formatPercent(pnlPercent), isProfitable: rewardValue > 0 })
    }
    return positions
  }, [dusdcStaked, dethStaked, dusdcPendingReward, dethPendingReward, lpNftBalance, lpValue, currentEthPrice])

  useEffect(() => {
    async function fetchRecentActivity() {
      if (!publicClient || !address) { setRecentActivity([]); setIsLoadingActivity(false); return }
      setIsLoadingActivity(true)
      try {
        const currentBlock = await publicClient.getBlockNumber()
        const fromBlock = currentBlock - 10000n

        const stakedLogs = await publicClient.getLogs({
          address: CORE_STAKING_ADDRESS as `0x${string}`,
          event: { type: 'event', name: 'Staked', inputs: [{ type: 'address', name: 'user', indexed: true }, { type: 'uint256', name: 'poolId', indexed: true }, { type: 'uint256', name: 'amount', indexed: false }] },
          args: { user: address }, fromBlock, toBlock: currentBlock,
        })

        const unstakedLogs = await publicClient.getLogs({
          address: CORE_STAKING_ADDRESS as `0x${string}`,
          event: { type: 'event', name: 'Unstaked', inputs: [{ type: 'address', name: 'user', indexed: true }, { type: 'uint256', name: 'poolId', indexed: true }, { type: 'uint256', name: 'amount', indexed: false }] },
          args: { user: address }, fromBlock, toBlock: currentBlock,
        })

        const claimedLogs = await publicClient.getLogs({
          address: CORE_STAKING_ADDRESS as `0x${string}`,
          event: { type: 'event', name: 'Claimed', inputs: [{ type: 'address', name: 'user', indexed: true }, { type: 'uint256', name: 'poolId', indexed: true }, { type: 'uint256', name: 'amount', indexed: false }] },
          args: { user: address }, fromBlock, toBlock: currentBlock,
        })

        const activities: Array<{ type: string; description: string; time: string; status: string; blockNumber: bigint }> = []

        for (const log of stakedLogs) {
          const poolId = log.args.poolId as bigint; const amount = log.args.amount as bigint
          const isUSDC = poolId === 0n; const decimals = isUSDC ? TOKEN_DECIMALS.dUSDC : TOKEN_DECIMALS.dETH; const symbol = isUSDC ? "dUSDC" : "dETH"
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
          activities.push({ type: "Stake", description: `${Number(formatUnits(amount, decimals)).toFixed(isUSDC ? 2 : 4)} ${symbol} staked`, time: getTimeAgo(Number(block.timestamp)), status: "success", blockNumber: log.blockNumber })
        }
        for (const log of unstakedLogs) {
          const poolId = log.args.poolId as bigint; const amount = log.args.amount as bigint
          const isUSDC = poolId === 0n; const decimals = isUSDC ? TOKEN_DECIMALS.dUSDC : TOKEN_DECIMALS.dETH; const symbol = isUSDC ? "dUSDC" : "dETH"
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
          activities.push({ type: "Unstake", description: `${Number(formatUnits(amount, decimals)).toFixed(isUSDC ? 2 : 4)} ${symbol} unstaked`, time: getTimeAgo(Number(block.timestamp)), status: "success", blockNumber: log.blockNumber })
        }
        for (const log of claimedLogs) {
          const amount = log.args.amount as bigint
          const block = await publicClient.getBlock({ blockNumber: log.blockNumber })
          activities.push({ type: "Claim", description: `${Number(formatUnits(amount, 18)).toFixed(4)} CORE claimed`, time: getTimeAgo(Number(block.timestamp)), status: "success", blockNumber: log.blockNumber })
        }

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

  const isLoading = dethLoading || dusdcLoading || coreLoading || dusdcStakeLoading || dethStakeLoading

  const summaryCards = [
    { title: "Total Balance", value: isConnected ? formatUSD(totalBalance) : "$0.00", change: "+5.2%", positive: true, icon: Wallet },
    { title: "Total P&L", value: isConnected ? (totalPnL > 0 ? `+${formatUSD(totalPnL)}` : formatUSD(totalPnL)) : "$0.00", change: totalPnL > 0 ? formatPercent((totalPnL / Math.max(totalBalance, 1)) * 100) : "0%", positive: totalPnL >= 0, icon: TrendingUp },
    { title: "Open Positions", value: isConnected ? openPositions.count.toString() : "0", change: isConnected && openPositions.profitable > 0 ? `${openPositions.profitable} profitable` : "0 profitable", positive: openPositions.profitable > 0, icon: LayoutGrid },
    { title: "Liquidity Provided", value: isConnected ? formatUSD(liquidityProvided) : "$0.00", change: `+${formatUSD(totalPnL)} rewards`, positive: true, icon: Droplets },
  ]

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
            <div>
              <SectionHeader title="Dashboard" as="h1" />
              <p className="text-sm text-muted-foreground mt-1">
                {isConnected ? "Overview of your DeFi portfolio" : "Connect wallet to view your portfolio"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isConnected && (
                isGenesisHolder ? (
                  <div
                    className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/8 border border-primary/20"
                    title="Genesis Pass holder — early supporter of Altera"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-primary">Genesis Holder</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-md bg-surface-2 border border-border text-xs text-muted-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      Early supporter of Altera
                    </div>
                  </div>
                ) : (
                  <div
                    className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-2 border border-border opacity-50"
                    title="You don't own a Genesis Pass yet"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-muted-foreground">Not a Genesis Holder</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-md bg-surface-2 border border-border text-xs text-muted-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      Mint a Genesis Pass to become an early supporter
                    </div>
                  </div>
                )
              )}
              <GenesisBadge />
            </div>
          </div>

          {/* Summary stat tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-up stagger-1">
            {summaryCards.map((card) => (
              <div key={card.title} className="rounded-lg border border-border bg-surface-1 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  {isLoading ? (
                    <SkeletonLine className="h-4 w-14" />
                  ) : (
                    <span className={cn(
                      "text-xs font-mono px-1.5 py-0.5 rounded border",
                      card.positive
                        ? "text-success bg-success/8 border-success/20"
                        : "text-destructive bg-destructive/8 border-destructive/20"
                    )}>
                      {card.change}
                    </span>
                  )}
                </div>
                {isLoading ? (
                  <SkeletonLine className="h-7 w-28 mb-1.5" />
                ) : (
                  <p className="text-xl font-data font-semibold text-foreground">{card.value}</p>
                )}
                <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60 mt-1">{card.title}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up stagger-2">

            {/* Portfolio */}
            <div className="rounded-lg border border-border bg-surface-1 lg:col-span-1">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Portfolio</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your token balances</p>
              </div>
              <div className="px-5 py-4">
                {!isConnected ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Connect wallet to view portfolio</p>
                ) : isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="space-y-2"><SkeletonLine className="h-4 w-16" /><SkeletonLine className="h-3 w-20" /></div>
                        <div className="space-y-2 text-right"><SkeletonLine className="h-4 w-20" /><SkeletonLine className="h-3 w-12" /></div>
                      </div>
                    ))}
                  </div>
                ) : portfolio.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No tokens found. Get some from the Faucet!</p>
                ) : (
                  <div className="divide-y divide-border/50">
                    {portfolio.map(item => (
                      <div key={item.token} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.token}</p>
                          <p className="text-xs font-mono text-muted-foreground">{item.balance}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-data font-medium text-foreground">{item.value}</p>
                          <p className={cn("text-xs font-mono", item.positive === true ? "text-success" : item.positive === false ? "text-destructive" : "text-muted-foreground")}>
                            {item.change}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border border-border bg-surface-1 lg:col-span-1">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Recent Activity</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your latest transactions</p>
              </div>
              <div className="px-5 py-4">
                {!isConnected ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Connect wallet to view activity</p>
                ) : isLoadingActivity ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-start gap-3 py-2">
                        <SkeletonLine className="h-2 w-2 rounded-full mt-1.5 shrink-0" />
                        <div className="flex-1 space-y-2"><SkeletonLine className="h-4 w-16" /><SkeletonLine className="h-3 w-32" /></div>
                        <SkeletonLine className="h-3 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto divide-y divide-border/50 pr-1">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 py-3">
                        <div className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", activity.status === "success" ? "bg-success" : "bg-warning")} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{activity.type}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Positions */}
            <div className="rounded-lg border border-border bg-surface-1 lg:col-span-1">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">Active Positions</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your open positions</p>
              </div>
              <div className="px-5 py-4">
                {!isConnected ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Connect wallet to view positions</p>
                ) : isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between py-2">
                        <div className="space-y-2"><SkeletonLine className="h-4 w-12" /><SkeletonLine className="h-3 w-16" /></div>
                        <SkeletonLine className="h-4 w-16" />
                        <SkeletonLine className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                ) : activePositions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No active positions</p>
                ) : (
                  <div className="divide-y divide-border/50">
                    {/* Header row */}
                    <div className="flex items-center pb-2 gap-4">
                      <span className="flex-1 text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60">Type</span>
                      <span className="w-24 text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60">Size</span>
                      <span className="w-16 text-right text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60">P&L</span>
                    </div>
                    {activePositions.map(position => (
                      <div key={position.id} className="flex items-center py-3 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{position.type}</p>
                          <p className="text-xs text-muted-foreground">{position.pair}</p>
                        </div>
                        <p className="w-24 text-sm font-data text-foreground">{position.size}</p>
                        <div className="w-16 flex items-center justify-end gap-1">
                          {position.isProfitable
                            ? <ArrowUpRight className="h-3 w-3 text-success shrink-0" strokeWidth={1.5} />
                            : <ArrowDownRight className="h-3 w-3 text-destructive shrink-0" strokeWidth={1.5} />
                          }
                          <span className={cn("text-xs font-mono", position.isProfitable ? "text-success" : "text-destructive")}>
                            {position.pnlPercent}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  )
}
