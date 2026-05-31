'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Coins,
  Gift,
  Lock,
  Unlock,
  CheckCircle2,
  Circle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { PageLayout } from '@/components/page-layout'
import { NetworkGuardBanner } from '@/components/ui/network-guard-banner'
import { StatusBadge } from '@/components/ui/status-badge'
import { SectionHeader } from '@/components/ui/section-header'
import { cn } from '@/lib/utils'
import {
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
  CORE_STAKING_ADDRESS,
  CORE_STAKING_ABI,
  ERC20_ABI,
  POOL_ADDRESS,
  POOL_ABI,
} from '@/lib/uniswap-config'

type PoolType = 'dusdc' | 'deth'

const POOL_IDS: Record<PoolType, bigint> = {
  dusdc: 0n,
  deth: 1n,
}

function formatAmount(value: bigint, decimals: number, maxDecimals = 6): string {
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)
  if (num === 0) return '0'
  if (num < 0.000001) return '<0.000001'
  return num.toLocaleString(undefined, { maximumFractionDigits: maxDecimals })
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-surface-2 border border-border px-4 py-3">
      <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60 mb-1">{label}</p>
      <p className={cn('text-base font-data font-semibold', accent ? 'text-success' : 'text-foreground')}>
        {value}
      </p>
    </div>
  )
}

// ─── Pool tab button ──────────────────────────────────────────────────────────

function PoolTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer',
        active
          ? 'bg-surface-1 border border-border text-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

// ─── Amount input ─────────────────────────────────────────────────────────────

function AmountInput({
  label,
  value,
  onChange,
  onMax,
  maxLabel,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onMax: () => void
  maxLabel: string
  disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{maxLabel}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className={cn(
            'flex-1 h-10 rounded-md border border-border bg-surface-2 px-3 text-sm font-data text-foreground',
            'placeholder:text-muted-foreground/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'transition-colors duration-150',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        />
        <button
          type="button"
          onClick={onMax}
          disabled={disabled}
          className={cn(
            'px-3 h-10 rounded-md border border-border bg-surface-3 text-xs font-mono text-muted-foreground',
            'hover:text-foreground hover:bg-surface-3/80 transition-colors duration-150 cursor-pointer shrink-0',
            disabled && 'opacity-40 cursor-not-allowed',
          )}
        >
          Max
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StakingPage() {
  const { address, isConnected, chain } = useAccount()
  const isOnSepolia = !chain || chain.id === sepolia.id
  const [activePool, setActivePool] = useState<PoolType>('dusdc')
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [pendingAction, setPendingAction] = useState<string | null>(null)

  const poolId = POOL_IDS[activePool]
  const stakedToken = activePool === 'dusdc' ? TOKEN_ADDRESSES.dUSDC : TOKEN_ADDRESSES.dETH
  const stakedTokenDecimals = activePool === 'dusdc' ? TOKEN_DECIMALS.dUSDC : TOKEN_DECIMALS.dETH
  const stakedTokenSymbol = activePool === 'dusdc' ? 'dUSDC' : 'dETH'

  const { data: tokenBalance, refetch: refetchBalance } = useBalance({
    address,
    token: stakedToken as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: stakedToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CORE_STAKING_ADDRESS as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'userInfo',
    args: address ? [poolId, address] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: pendingReward, refetch: refetchPendingReward } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'pendingReward',
    args: address ? [address, poolId] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: poolInfo, refetch: refetchPoolInfo } = useReadContract({
    address: CORE_STAKING_ADDRESS as `0x${string}`,
    abi: CORE_STAKING_ABI,
    functionName: 'pools',
    args: [poolId],
    chainId: sepolia.id,
  })

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

  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const currentPrice = (() => {
    if (!slot0 || !token0Address) return 0
    const sqrtPriceX96 = slot0[0] as bigint
    const Q192 = 2n ** 192n
    const DECIMAL_ADJUST = 10n ** 12n
    const isDethToken0 = token0Address.toLowerCase() === TOKEN_ADDRESSES.dETH.toLowerCase()
    const priceRaw = (sqrtPriceX96 * sqrtPriceX96 * DECIMAL_ADJUST) / Q192
    if (isDethToken0) return Number(priceRaw)
    return priceRaw > 0n ? Number(DECIMAL_ADJUST * DECIMAL_ADJUST) / Number(priceRaw) : 0
  })()

  const userStaked = userInfo ? (userInfo as [bigint, bigint])[0] : 0n

  const totalStaked = (() => {
    if (!poolInfo) return 0n
    const poolData = poolInfo as unknown
    if (Array.isArray(poolData) && poolData.length > 1) return poolData[1] as bigint
    if ((poolData as Record<string, unknown>).totalStaked !== undefined)
      return (poolData as Record<string, bigint>).totalStaked
    return 0n
  })()

  const calculateAPY = () => {
    if (totalStaked === 0n) return '0%'
    const totalStakedNum = Number(formatUnits(totalStaked, stakedTokenDecimals))
    if (totalStakedNum === 0) return '0%'
    const totalStakedValue = activePool === 'dusdc' ? totalStakedNum : totalStakedNum * currentPrice
    const annualRewardsPerUSD = 31.536
    const totalAnnualRewards = totalStakedValue * annualRewardsPerUSD
    const corePrice = 0.01
    const annualRewardsValue = totalAnnualRewards * corePrice
    const apy = (annualRewardsValue / totalStakedValue) * 100
    if (apy > 1000) return '>1000%'
    if (apy < 0.01) return '<0.01%'
    return `${apy.toFixed(2)}%`
  }

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

  const onChainPendingReward: bigint =
    pendingReward !== undefined && pendingReward !== null ? (pendingReward as bigint) : 0n

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss('staking-action')
      if (pendingAction === 'approve') toast.success(`${stakedTokenSymbol} approved for staking`)
      else if (pendingAction === 'stake') { toast.success(`Successfully staked ${stakedTokenSymbol}`); setStakeAmount('') }
      else if (pendingAction === 'unstake') { toast.success(`Successfully unstaked ${stakedTokenSymbol}`); setUnstakeAmount('') }
      else if (pendingAction === 'claim') toast.success('Rewards claimed successfully!')
      refetchAllowance(); refetchUserInfo(); refetchPendingReward(); refetchPoolInfo(); refetchBalance()
      reset(); setPendingAction(null)
    }
  }, [isSuccess, pendingAction, stakedTokenSymbol, reset, refetchAllowance, refetchUserInfo, refetchPendingReward, refetchPoolInfo, refetchBalance])

  useEffect(() => { setStakeAmount(''); setUnstakeAmount(''); setPendingAction(null) }, [activePool])
  useEffect(() => { setStakeAmount(''); setUnstakeAmount(''); setPendingAction(null); reset() }, [address, reset])

  const stakeAmountBN = stakeAmount ? parseUnits(stakeAmount, stakedTokenDecimals) : 0n
  const isApproved = (allowance ?? 0n) >= stakeAmountBN && stakeAmountBN > 0n

  const handleApprove = () => {
    if (!address || stakeAmountBN === 0n) return
    setPendingAction('approve')
    writeContract({
      address: stakedToken as `0x${string}`, abi: ERC20_ABI, functionName: 'approve',
      args: [CORE_STAKING_ADDRESS as `0x${string}`, stakeAmountBN], chain: sepolia, account: address,
    })
    toast.loading(`Approving ${stakedTokenSymbol}...`, { id: 'staking-action' })
  }

  const handleStake = () => {
    if (!address || stakeAmountBN === 0n) return
    setPendingAction('stake')
    writeContract({
      address: CORE_STAKING_ADDRESS as `0x${string}`, abi: CORE_STAKING_ABI, functionName: 'stake',
      args: [poolId, stakeAmountBN], chain: sepolia, account: address,
    })
    toast.loading(`Staking ${stakeAmount} ${stakedTokenSymbol}...`, { id: 'staking-action' })
  }

  const handleUnstake = () => {
    if (!address) return
    const unstakeAmountBN = parseUnits(unstakeAmount, stakedTokenDecimals)
    if (unstakeAmountBN === 0n) return
    setPendingAction('unstake')
    writeContract({
      address: CORE_STAKING_ADDRESS as `0x${string}`, abi: CORE_STAKING_ABI, functionName: 'unstake',
      args: [poolId, unstakeAmountBN], chain: sepolia, account: address,
    })
    toast.loading(`Unstaking ${unstakeAmount} ${stakedTokenSymbol}...`, { id: 'staking-action' })
  }

  const handleClaim = () => {
    if (!address || onChainPendingReward === 0n) return
    setPendingAction('claim')
    writeContract({
      address: CORE_STAKING_ADDRESS as `0x${string}`, abi: CORE_STAKING_ABI, functionName: 'claim',
      args: [poolId], chain: sepolia, account: address,
    })
    toast.loading('Claiming rewards...', { id: 'staking-action' })
  }

  const isLoading = isPending || isConfirming
  const isValidStakeAmount = stakeAmount && parseFloat(stakeAmount) > 0
  const isValidUnstakeAmount = unstakeAmount && parseFloat(unstakeAmount) > 0

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8 animate-fade-up">
            <SectionHeader title="Staking" as="h1" description="Stake tokens to earn CORE rewards" />
            <StatusBadge variant="testnet" label="Sepolia" />
          </div>

          {/* Wrong network */}
          {isConnected && !isOnSepolia && (
            <div className="mb-6">
              <NetworkGuardBanner expectedNetwork="Sepolia" isWrongNetwork={true} />
            </div>
          )}

          {/* Pool selector */}
          <div className="flex gap-1.5 p-1 rounded-md bg-surface-2 border border-border max-w-xs mb-8 animate-fade-up stagger-1">
            <PoolTab label="dUSDC Pool" active={activePool === 'dusdc'} onClick={() => setActivePool('dusdc')} />
            <PoolTab label="dETH Pool" active={activePool === 'deth'} onClick={() => setActivePool('deth')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up stagger-2">

            {/* ── Left: Pool info + rewards ─────────────────────────────────── */}
            <div className="space-y-4">

              {/* Pool info */}
              <div className="rounded-lg border border-border bg-surface-1">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <Coins className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold text-foreground">Pool Info</h2>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <StatTile label="Reward Token" value="CORE" />
                    <StatTile label="Staked Token" value={stakedTokenSymbol} />
                    <StatTile
                      label="Total Staked"
                      value={`${formatAmount(totalStaked, stakedTokenDecimals, 2)} ${stakedTokenSymbol}`}
                    />
                    <StatTile label="APY" value={calculateAPY()} accent />
                  </div>
                  <div className="rounded-md border border-primary/20 bg-primary/5 px-4 py-3">
                    <p className="text-[11px] font-mono uppercase tracking-wide text-muted-foreground/60 mb-1">
                      Your Staked
                    </p>
                    <p className="text-xl font-data font-semibold text-foreground">
                      {formatAmount(userStaked, stakedTokenDecimals, 4)} {stakedTokenSymbol}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending rewards */}
              <div className="rounded-lg border border-border bg-surface-1">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <Gift className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold text-foreground">Pending Rewards</h2>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div className="rounded-md bg-surface-2 border border-border px-4 py-4 text-center">
                    <p className="text-3xl font-data font-semibold text-primary">
                      {Number(formatUnits(onChainPendingReward, 18)).toFixed(8)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">CORE</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={onChainPendingReward === 0n || isLoading || !isConnected}
                    className={cn(
                      'w-full h-10 rounded-md text-sm font-semibold',
                      'inline-flex items-center justify-center gap-2',
                      'transition-all duration-150 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                      onChainPendingReward > 0n && !isLoading && isConnected
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                        : 'bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                    )}
                  >
                    {isLoading && pendingAction === 'claim' && (
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                    )}
                    {isLoading && pendingAction === 'claim' ? 'Claiming...' : 'Claim Rewards'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right: Stake + Unstake ────────────────────────────────────── */}
            <div className="space-y-4">

              {/* Stake */}
              <div className="rounded-lg border border-border bg-surface-1">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <Lock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">Stake {stakedTokenSymbol}</h2>
                    {activePool === 'deth' && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        dETH is Dummy ETH (ERC-20), not native ETH
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <AmountInput
                    label="Amount"
                    value={stakeAmount}
                    onChange={setStakeAmount}
                    onMax={() => tokenBalance && setStakeAmount(formatUnits(tokenBalance.value, stakedTokenDecimals))}
                    maxLabel={`Balance: ${tokenBalance ? formatAmount(tokenBalance.value, stakedTokenDecimals, 4) : '0'}`}
                    disabled={!isConnected}
                  />

                  {/* Approval status */}
                  {isValidStakeAmount && (
                    <div className="flex items-center gap-2 text-xs">
                      {isApproved ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                          <span className="text-success">Approved</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                          <span className="text-muted-foreground">Approval required</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Stake / Approve button */}
                  {!isConnected ? (
                    <button disabled className="w-full h-10 rounded-md bg-surface-3 text-muted-foreground/40 text-sm cursor-not-allowed">
                      Connect Wallet
                    </button>
                  ) : !isValidStakeAmount ? (
                    <button disabled className="w-full h-10 rounded-md bg-surface-3 text-muted-foreground/40 text-sm cursor-not-allowed">
                      Enter Amount
                    </button>
                  ) : !isApproved ? (
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isLoading}
                      className={cn(
                        'w-full h-10 rounded-md text-sm font-semibold',
                        'inline-flex items-center justify-center gap-2',
                        'transition-all duration-150 cursor-pointer',
                        !isLoading
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                          : 'bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                      )}
                    >
                      {isLoading && pendingAction === 'approve' && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                      {isLoading && pendingAction === 'approve' ? 'Approving...' : `Approve ${stakedTokenSymbol}`}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStake}
                      disabled={isLoading}
                      className={cn(
                        'w-full h-10 rounded-md text-sm font-semibold',
                        'inline-flex items-center justify-center gap-2',
                        'transition-all duration-150 cursor-pointer',
                        !isLoading
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                          : 'bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                      )}
                    >
                      {isLoading && pendingAction === 'stake' && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                      {isLoading && pendingAction === 'stake' ? 'Staking...' : 'Stake'}
                    </button>
                  )}
                </div>
              </div>

              {/* Unstake */}
              <div className="rounded-lg border border-border bg-surface-1">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                  <Unlock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <h2 className="text-sm font-semibold text-foreground">Unstake {stakedTokenSymbol}</h2>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <AmountInput
                    label="Amount"
                    value={unstakeAmount}
                    onChange={setUnstakeAmount}
                    onMax={() => setUnstakeAmount(formatUnits(userStaked, stakedTokenDecimals))}
                    maxLabel={`Staked: ${formatAmount(userStaked, stakedTokenDecimals, 4)}`}
                    disabled={!isConnected || userStaked === 0n}
                  />
                  <button
                    type="button"
                    onClick={handleUnstake}
                    disabled={!isValidUnstakeAmount || isLoading || !isConnected || userStaked === 0n}
                    className={cn(
                      'w-full h-10 rounded-md text-sm font-semibold border',
                      'inline-flex items-center justify-center gap-2',
                      'transition-all duration-150 cursor-pointer',
                      isValidUnstakeAmount && !isLoading && isConnected && userStaked > 0n
                        ? 'border-border bg-surface-2 text-foreground hover:bg-surface-3 active:scale-[0.98]'
                        : 'border-border bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                    )}
                  >
                    {isLoading && pendingAction === 'unstake' && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                    {isLoading && pendingAction === 'unstake' ? 'Unstaking...' : 'Unstake'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
