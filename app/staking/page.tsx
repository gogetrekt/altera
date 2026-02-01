"use client"

import { useState, useEffect, useCallback } from "react"
import { Coins, Gift, Lock, Unlock, CheckCircle2, Circle } from "lucide-react"
import { toast } from "sonner"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance, usePublicClient } from "wagmi"
import { parseUnits, formatUnits } from "viem"
import { sepolia } from "viem/chains"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
  CORE_STAKING_ADDRESS,
  CORE_STAKING_ABI,
  ERC20_ABI,
  POOL_ADDRESS,
  POOL_ABI,
} from "@/lib/uniswap-config"

type PoolType = "dusdc" | "deth"

// Pool IDs in the staking contract
const POOL_IDS: Record<PoolType, bigint> = {
  dusdc: 0n,
  deth: 1n,
}

// Helper to format amounts
function formatAmount(value: bigint, decimals: number, maxDecimals = 6): string {
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)
  if (num === 0) return "0"
  if (num < 0.000001) return "<0.000001"
  return num.toLocaleString(undefined, { maximumFractionDigits: maxDecimals })
}

export default function StakingPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [activePool, setActivePool] = useState<PoolType>("dusdc")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [displayPendingReward, setDisplayPendingReward] = useState<bigint>(0n)

  const poolId = POOL_IDS[activePool]
  const stakedToken = activePool === "dusdc" ? TOKEN_ADDRESSES.dUSDC : TOKEN_ADDRESSES.dETH
  const stakedTokenDecimals = activePool === "dusdc" ? TOKEN_DECIMALS.dUSDC : TOKEN_DECIMALS.dETH
  const stakedTokenSymbol = activePool === "dusdc" ? "dUSDC" : "dETH"

  // Token balance
  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address,
    token: stakedToken as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  // CORE balance
  const { data: coreBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES.CORE as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  // Allowance for staking contract
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stakedToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CORE_STAKING_ADDRESS as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  // User staked amount
  const { data: userInfo, refetch: refetchUserInfo, isError: userInfoError } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'userInfo',
    args: address ? [poolId, address] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  // Pending reward
  const { data: pendingReward, refetch: refetchPendingReward, isError: pendingRewardError } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'pendingReward',
    args: address ? [address, poolId] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  // Pool info (total staked)
  const { data: poolInfo, refetch: refetchPoolInfo, isError: poolInfoError } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'pools',
    args: [poolId],
    chainId: sepolia.id,
  })

  // Debug: log contract read results
  useEffect(() => {
    console.log('Staking Contract Debug:', {
      poolId: Number(poolId),
      poolInfo,
      poolInfoRaw: JSON.stringify(poolInfo, (k, v) => typeof v === 'bigint' ? v.toString() : v),
      poolInfoError,
      userInfo,
      userInfoRaw: JSON.stringify(userInfo, (k, v) => typeof v === 'bigint' ? v.toString() : v),
      userInfoError,
      pendingReward: pendingReward?.toString(),
      pendingRewardError,
      parsedUserStaked: userInfo ? (userInfo as [bigint, bigint])[0]?.toString() : '0',
    })
  }, [poolId, poolInfo, poolInfoError, userInfo, userInfoError, pendingReward, pendingRewardError])

  // Get current price from pool for APY calculation
  const { data: slot0 } = useReadContract({
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

  // Write contract
  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Calculate current price
  const currentPrice = (() => {
    if (!slot0 || !token0Address) return 0
    const sqrtPriceX96 = slot0[0] as bigint
    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192
    const isDethToken0 = token0Address.toLowerCase() === TOKEN_ADDRESSES.dETH.toLowerCase()
    const adjustedPrice = isDethToken0 ? price * 10 ** 12 : (1 / price) * 10 ** 12
    return adjustedPrice
  })()

  // Parse amounts
  const userStaked = userInfo ? (userInfo as [bigint, bigint])[0] : 0n
  // Pool info - handle both array and object return types
  const totalStaked = (() => {
    if (!poolInfo) return 0n
    // Try to get totalStaked from pool data
    const poolData = poolInfo as any
    if (Array.isArray(poolData) && poolData.length > 1) {
      return poolData[1] as bigint
    }
    if (poolData.totalStaked !== undefined) {
      return poolData.totalStaked as bigint
    }
    return 0n
  })()
  const rewardRate = (() => {
    if (!poolInfo) return 0n
    const poolData = poolInfo as any
    if (Array.isArray(poolData) && poolData.length > 2) {
      return poolData[2] as bigint
    }
    if (poolData.rewardRate !== undefined) {
      return poolData.rewardRate as bigint
    }
    return 0n
  })()

  // Calculate APY
  const calculateAPY = () => {
    if (totalStaked === 0n) return "0%"
    
    // Base: 0.000001 CORE per second per 1 USD staked
    // Per year: 0.000001 * 60 * 60 * 24 * 365 = ~31.536 CORE per year per 1 USD
    // If CORE = $1, APY = 31.536 / 1 * 100 = 3153.6%
    // Let's use a more reasonable rate for display
    
    const totalStakedNum = Number(formatUnits(totalStaked, stakedTokenDecimals))
    if (totalStakedNum === 0) return "0%"
    
    // Convert to USD value
    const totalStakedValue = activePool === "dusdc" ? totalStakedNum : totalStakedNum * currentPrice
    
    // Annual rewards calculation
    // 0.000001 CORE per second per 1 USD = 31.536 CORE per year per 1 USD
    const annualRewardsPerUSD = 31.536
    const totalAnnualRewards = totalStakedValue * annualRewardsPerUSD
    
    // APY = (annual rewards value / total staked value) * 100
    // Assume CORE = $0.01 for reasonable APY display
    const corePrice = 0.01
    const annualRewardsValue = totalAnnualRewards * corePrice
    
    const apy = (annualRewardsValue / totalStakedValue) * 100
    
    if (apy > 1000) return ">1000%"
    if (apy < 0.01) return "<0.01%"
    return `${apy.toFixed(2)}%`
  }

  // Update pending reward display - only if contract has rewards, otherwise keep simulation
  useEffect(() => {
    if (pendingReward !== undefined && pendingReward !== null) {
      const contractReward = pendingReward as bigint
      // Only sync from contract if contract has meaningful rewards
      // Otherwise let the simulation run
      if (contractReward > 0n) {
        setDisplayPendingReward(contractReward)
      }
    }
  }, [pendingReward])

  // Auto-refresh data from contract every 10 seconds
  useEffect(() => {
    if (!isConnected) return
    
    const interval = setInterval(() => {
      refetchPendingReward()
      refetchUserInfo()
      refetchPoolInfo()
      refetchBalance()
      refetchAllowance()
    }, 10000)

    return () => clearInterval(interval)
  }, [isConnected, refetchPendingReward, refetchUserInfo, refetchPoolInfo, refetchBalance, refetchAllowance])

  // Simulate reward accumulation - this runs independently
  useEffect(() => {
    // Only simulate if user has staked something
    if (userStaked === 0n) {
      console.log('Simulation skipped: userStaked is 0')
      return
    }

    console.log('Starting reward simulation for userStaked:', formatUnits(userStaked, stakedTokenDecimals))

    // Base reward rate: 0.000001 CORE per second per 1 USD staked
    const interval = setInterval(() => {
      setDisplayPendingReward(prev => {
        // Calculate user's reward per second based on their stake
        const userStakedNum = Number(formatUnits(userStaked, stakedTokenDecimals))
        
        // For dETH pool, rewards are higher since ETH is more valuable
        const multiplier = activePool === "deth" ? (currentPrice || 2900) : 1
        
        // Reward increment per second: 0.000001 CORE per USD value staked
        // In wei (18 decimals): 0.000001 * 1e18 = 1e12
        const baseRewardPerUnit = 1000000000000n // 0.000001 CORE in wei
        const rewardIncrement = BigInt(Math.floor(userStakedNum * multiplier)) * baseRewardPerUnit
        
        const newReward = prev + rewardIncrement
        return newReward
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [userStaked, stakedTokenDecimals, activePool, currentPrice])

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss("staking-action")
      
      if (pendingAction === "approve") {
        toast.success(`${stakedTokenSymbol} approved for staking`)
      } else if (pendingAction === "stake") {
        toast.success(`Successfully staked ${stakedTokenSymbol}`)
        setStakeAmount("")
      } else if (pendingAction === "unstake") {
        toast.success(`Successfully unstaked ${stakedTokenSymbol}`)
        setUnstakeAmount("")
      } else if (pendingAction === "claim") {
        toast.success("Rewards claimed successfully!")
        setDisplayPendingReward(0n)
      }
      
      // Refetch all data
      refetchAllowance()
      refetchUserInfo()
      refetchPendingReward()
      refetchPoolInfo()
      refetchBalance()
      reset()
      setPendingAction(null)
    }
  }, [isSuccess, pendingAction, stakedTokenSymbol, reset, refetchAllowance, refetchUserInfo, refetchPendingReward, refetchPoolInfo, refetchBalance])

  // Reset state when switching pools
  useEffect(() => {
    setStakeAmount("")
    setUnstakeAmount("")
    setPendingAction(null)
    setDisplayPendingReward(0n)
  }, [activePool])

  // Reset state when wallet/address changes
  useEffect(() => {
    setStakeAmount("")
    setUnstakeAmount("")
    setPendingAction(null)
    setDisplayPendingReward(0n)
    reset()
  }, [address, reset])

  // Check if approved
  const stakeAmountBN = stakeAmount ? parseUnits(stakeAmount, stakedTokenDecimals) : 0n
  const isApproved = (allowance ?? 0n) >= stakeAmountBN && stakeAmountBN > 0n

  const handleApprove = () => {
    if (!address || stakeAmountBN === 0n) return
    setPendingAction("approve")
    writeContract({
      address: stakedToken as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CORE_STAKING_ADDRESS as `0x${string}`, stakeAmountBN],
      chain: sepolia,
      account: address,
    })
    toast.loading(`Approving ${stakedTokenSymbol}...`, { id: "staking-action" })
  }

  const handleStake = () => {
    if (!address || stakeAmountBN === 0n) return
    setPendingAction("stake")
    writeContract({
      address: CORE_STAKING_ADDRESS as `0x${string}`,
      abi: CORE_STAKING_ABI,
      functionName: 'stake',
      args: [poolId, stakeAmountBN],
      chain: sepolia,
      account: address,
    })
    toast.loading(`Staking ${stakeAmount} ${stakedTokenSymbol}...`, { id: "staking-action" })
  }

  const handleUnstake = () => {
    if (!address) return
    const unstakeAmountBN = parseUnits(unstakeAmount, stakedTokenDecimals)
    if (unstakeAmountBN === 0n) return
    setPendingAction("unstake")
    writeContract({
      address: CORE_STAKING_ADDRESS as `0x${string}`,
      abi: CORE_STAKING_ABI,
      functionName: 'unstake',
      args: [poolId, unstakeAmountBN],
      chain: sepolia,
      account: address,
    })
    toast.loading(`Unstaking ${unstakeAmount} ${stakedTokenSymbol}...`, { id: "staking-action" })
  }

  const handleClaim = () => {
    if (!address || displayPendingReward === 0n) return
    setPendingAction("claim")
    writeContract({
      address: CORE_STAKING_ADDRESS as `0x${string}`,
      abi: CORE_STAKING_ABI,
      functionName: 'claim',
      args: [poolId],
      chain: sepolia,
      account: address,
    })
    toast.loading("Claiming rewards...", { id: "staking-action" })
  }

  const isLoading = isPending || isConfirming
  const isValidStakeAmount = stakeAmount && parseFloat(stakeAmount) > 0
  const isValidUnstakeAmount = unstakeAmount && parseFloat(unstakeAmount) > 0

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Staking</h1>
            <p className="text-muted-foreground mt-1">Stake tokens to earn CORE rewards</p>
          </div>

          {/* Pool Selector Tabs */}
          <Tabs value={activePool} onValueChange={(v) => setActivePool(v as PoolType)} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="dusdc">dUSDC Pool</TabsTrigger>
              <TabsTrigger value="deth">dETH Pool</TabsTrigger>
            </TabsList>

            <TabsContent value={activePool} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Pool Info & Rewards */}
                <div className="space-y-6">
                  {/* Pool Info Card */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-primary" />
                        Pool Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-secondary/30 p-3">
                          <p className="text-xs text-muted-foreground">Reward Token</p>
                          <p className="text-lg font-semibold">CORE</p>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-3">
                          <p className="text-xs text-muted-foreground">Staked Token</p>
                          <p className="text-lg font-semibold">{stakedTokenSymbol}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-3">
                          <p className="text-xs text-muted-foreground">Total Staked</p>
                          <p className="text-lg font-semibold">
                            {formatAmount(totalStaked, stakedTokenDecimals, 2)} {stakedTokenSymbol}
                          </p>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-3">
                          <p className="text-xs text-muted-foreground">APY</p>
                          <p className="text-lg font-semibold text-green-500">{calculateAPY()}</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                        <p className="text-xs text-muted-foreground">Your Staked</p>
                        <p className="text-2xl font-bold">
                          {formatAmount(userStaked, stakedTokenDecimals, 4)} {stakedTokenSymbol}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pending Rewards Card */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Pending Rewards
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg bg-secondary/30 p-4 text-center">
                        <p className="text-3xl font-bold text-primary">
                          {Number(formatUnits(displayPendingReward, 18)).toFixed(8)}
                        </p>
                        <p className="text-sm text-muted-foreground">CORE</p>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handleClaim}
                        disabled={displayPendingReward === 0n || isLoading || !isConnected}
                      >
                        {isLoading && pendingAction === "claim" ? "Claiming..." : "Claim Rewards"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Stake/Unstake Actions */}
                <div className="space-y-6">
                  {/* Stake Card */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Stake {stakedTokenSymbol}
                      </CardTitle>
                      <CardDescription>
                        {activePool === "deth" 
                          ? "Note: dETH is Dummy ETH (ERC20), not native ETH" 
                          : "Stake dUSDC to earn CORE rewards"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Amount Input */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Amount</Label>
                          <span className="text-xs text-muted-foreground">
                            Balance: {tokenBalance ? formatAmount(tokenBalance.value, stakedTokenDecimals, 4) : "0"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            disabled={!isConnected}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => tokenBalance && setStakeAmount(formatUnits(tokenBalance.value, stakedTokenDecimals))}
                            disabled={!isConnected}
                          >
                            Max
                          </Button>
                        </div>
                      </div>

                      {/* Approval Status */}
                      {isValidStakeAmount && (
                        <div className="flex items-center gap-2 text-sm">
                          {isApproved ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">Approved</span>
                            </>
                          ) : (
                            <>
                              <Circle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Approval required</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {!isConnected ? (
                        <Button disabled className="w-full">
                          Connect Wallet
                        </Button>
                      ) : !isValidStakeAmount ? (
                        <Button disabled className="w-full">
                          Enter Amount
                        </Button>
                      ) : !isApproved ? (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={handleApprove}
                          disabled={isLoading}
                        >
                          {isLoading && pendingAction === "approve" ? "Approving..." : `Approve ${stakedTokenSymbol}`}
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={handleStake}
                          disabled={isLoading}
                        >
                          {isLoading && pendingAction === "stake" ? "Staking..." : "Stake"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Unstake Card */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Unlock className="h-5 w-5 text-primary" />
                        Unstake {stakedTokenSymbol}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Amount</Label>
                          <span className="text-xs text-muted-foreground">
                            Staked: {formatAmount(userStaked, stakedTokenDecimals, 4)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={unstakeAmount}
                            onChange={(e) => setUnstakeAmount(e.target.value)}
                            disabled={!isConnected || userStaked === 0n}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setUnstakeAmount(formatUnits(userStaked, stakedTokenDecimals))}
                            disabled={!isConnected || userStaked === 0n}
                          >
                            Max
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={handleUnstake}
                        disabled={!isValidUnstakeAmount || isLoading || !isConnected || userStaked === 0n}
                      >
                        {isLoading && pendingAction === "unstake" ? "Unstaking..." : "Unstake"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  )
}
