"use client"

import { useState, useEffect } from "react"
import { Coins, Gift, Lock, Unlock, CheckCircle2, Circle } from "lucide-react"
import { toast } from "sonner"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type PoolType = "usdc" | "eth"

interface PoolInfo {
  rewardToken: string
  stakedToken: string
  totalStaked: string
  yourStaked: string
  pendingReward: string
  apy: string
}

const poolData: Record<PoolType, PoolInfo> = {
  usdc: {
    rewardToken: "CORE",
    stakedToken: "USDC",
    totalStaked: "2,450,000",
    yourStaked: "1,000.00",
    pendingReward: "25.50",
    apy: "12.5%",
  },
  eth: {
    rewardToken: "CORE",
    stakedToken: "dETH",
    totalStaked: "1,250",
    yourStaked: "0.5",
    pendingReward: "12.25",
    apy: "8.2%",
  },
}

export default function StakingPage() {
  const [activePool, setActivePool] = useState<PoolType>("usdc")
  const [stakeAmount, setStakeAmount] = useState("")
  const [unstakeAmount, setUnstakeAmount] = useState("")
  const [isApproved, setIsApproved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingReward, setPendingReward] = useState(Number.parseFloat(poolData[activePool].pendingReward))

  const pool = poolData[activePool]
  const balance = activePool === "usdc" ? "5,432.10" : "1.2345"

  // Simulate live reward updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingReward((prev) => prev + 0.001)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Reset approval when switching pools
  useEffect(() => {
    setIsApproved(false)
    setStakeAmount("")
    setUnstakeAmount("")
    setPendingReward(Number.parseFloat(poolData[activePool].pendingReward))
  }, [activePool])

  const handleApprove = async () => {
    setIsLoading(true)
    toast.loading(`Approving ${pool.stakedToken}...`, { id: "approve" })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsApproved(true)
    setIsLoading(false)
    toast.success(`${pool.stakedToken} approved`, { id: "approve" })
  }

  const handleStake = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) return
    setIsLoading(true)
    toast.loading(`Staking ${stakeAmount} ${pool.stakedToken}...`, { id: "stake" })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    toast.success(`Successfully staked ${stakeAmount} ${pool.stakedToken}`, { id: "stake" })
    setStakeAmount("")
  }

  const handleUnstake = async () => {
    if (!unstakeAmount || Number.parseFloat(unstakeAmount) <= 0) return
    setIsLoading(true)
    toast.loading(`Unstaking ${unstakeAmount} ${pool.stakedToken}...`, { id: "unstake" })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    toast.success(`Successfully unstaked ${unstakeAmount} ${pool.stakedToken}`, { id: "unstake" })
    setUnstakeAmount("")
  }

  const handleClaim = async () => {
    setIsLoading(true)
    toast.loading("Claiming rewards...", { id: "claim" })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    toast.success(`Claimed ${pendingReward.toFixed(4)} CORE`, { id: "claim" })
    setPendingReward(0)
  }

  const isValidStakeAmount = stakeAmount && Number.parseFloat(stakeAmount.replace(/,/g, "")) > 0
  const isValidUnstakeAmount = unstakeAmount && Number.parseFloat(unstakeAmount.replace(/,/g, "")) > 0

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
              <TabsTrigger value="usdc">USDC Pool</TabsTrigger>
              <TabsTrigger value="eth">ETH Pool</TabsTrigger>
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
                          <p className="text-lg font-semibold">{pool.rewardToken}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-3">
                          <p className="text-xs text-muted-foreground">Staked Token</p>
                          <p className="text-lg font-semibold">{pool.stakedToken}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-3">
                          <p className="text-xs text-muted-foreground">Total Staked</p>
                          <p className="text-lg font-semibold">{pool.totalStaked} {pool.stakedToken}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/30 p-3">
                          <p className="text-xs text-muted-foreground">APY</p>
                          <p className="text-lg font-semibold text-green-500">{pool.apy}</p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
                        <p className="text-xs text-muted-foreground">Your Staked</p>
                        <p className="text-2xl font-bold">{pool.yourStaked} {pool.stakedToken}</p>
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
                        <p className="text-3xl font-bold text-primary">{pendingReward.toFixed(4)}</p>
                        <p className="text-sm text-muted-foreground">CORE</p>
                      </div>
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={handleClaim}
                        disabled={pendingReward <= 0 || isLoading}
                      >
                        Claim Rewards
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Stake/Unstake Actions */}
                <div className="space-y-6">
                  {/* Stake Card with Steps */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        Stake {pool.stakedToken}
                      </CardTitle>
                      <CardDescription>
                        {activePool === "eth" ? "Note: ETH is Dummy ETH (ERC20), not native ETH" : "Stake USDC to earn CORE rewards"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Step 1: Approval */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {isApproved ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                          <span className={`font-medium ${isApproved ? "text-green-500" : ""}`}>
                            Step 1: Approve {pool.stakedToken}
                          </span>
                        </div>
                        {!isApproved && (
                          <Button
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={handleApprove}
                            disabled={isLoading}
                          >
                            {isLoading ? "Approving..." : `Approve ${pool.stakedToken}`}
                          </Button>
                        )}
                      </div>

                      {/* Step 2: Stake */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Circle className={`h-5 w-5 ${isApproved ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`font-medium ${!isApproved ? "text-muted-foreground" : ""}`}>
                            Step 2: Stake
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Amount</Label>
                            <span className="text-xs text-muted-foreground">Balance: {balance}</span>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              placeholder="0.0"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              disabled={!isApproved}
                            />
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setStakeAmount(balance.replace(/,/g, ""))}
                              disabled={!isApproved}
                            >
                              Max
                            </Button>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={handleStake}
                          disabled={!isApproved || !isValidStakeAmount || isLoading}
                        >
                          {isLoading ? "Staking..." : "Stake"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Unstake Card */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Unlock className="h-5 w-5 text-primary" />
                        Unstake {pool.stakedToken}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Amount</Label>
                          <span className="text-xs text-muted-foreground">Staked: {pool.yourStaked}</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="0.0"
                            value={unstakeAmount}
                            onChange={(e) => setUnstakeAmount(e.target.value)}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setUnstakeAmount(pool.yourStaked.replace(/,/g, ""))}
                          >
                            Max
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        onClick={handleUnstake}
                        disabled={!isValidUnstakeAmount || isLoading}
                      >
                        {isLoading ? "Unstaking..." : "Unstake"}
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
