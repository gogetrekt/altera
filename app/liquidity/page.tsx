'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Info, Wallet, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  usePublicClient,
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
  NONFUNGIBLE_POSITION_MANAGER,
  POOL_ADDRESS,
  POOL_FEE,
  ERC20_ABI,
  POOL_ABI,
  POSITION_MANAGER_ABI,
  MIN_TICK,
  MAX_TICK,
} from '@/lib/uniswap-config'

interface Position {
  tokenId: bigint
  liquidity: bigint
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  tokensOwed0: bigint
  tokensOwed1: bigint
}

function formatAmount(value: bigint, decimals: number, maxDecimals = 6): string {
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)
  if (num === 0) return '0'
  if (num < 0.000001) return '<0.000001'
  return num.toLocaleString(undefined, { maximumFractionDigits: maxDecimals })
}

const SLIPPAGE_BPS = 50n
const BPS_DENOMINATOR = 10000n

function applySlippage(amount: bigint): bigint {
  return (amount * (BPS_DENOMINATOR - SLIPPAGE_BPS)) / BPS_DENOMINATOR
}

// ─── Amount input ─────────────────────────────────────────────────────────────

function LiquidityInput({
  label,
  value,
  onChange,
  onMax,
  balanceLabel,
  approvalNote,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onMax: () => void
  balanceLabel: string
  approvalNote?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{balanceLabel}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 h-10 rounded-md border border-border bg-surface-2 px-3 text-sm font-data text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors duration-150"
        />
        <button
          type="button"
          onClick={onMax}
          className="px-3 h-10 rounded-md border border-border bg-surface-3 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-surface-3/80 transition-colors duration-150 cursor-pointer shrink-0"
        >
          Max
        </button>
      </div>
      {approvalNote && (
        <p className="text-[11px] text-warning/80 font-mono">Approval required</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LiquidityPage() {
  const { address, isConnected, chain } = useAccount()
  const isOnSepolia = !chain || chain.id === sepolia.id
  const publicClient = usePublicClient()
  const [dethAmount, setDethAmount] = useState('')
  const [dusdcAmount, setDusdcAmount] = useState('')
  const [positions, setPositions] = useState<Position[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)
  const [closingPositionId, setClosingPositionId] = useState<bigint | null>(null)
  const [isClosingPosition, setIsClosingPosition] = useState(false)
  const [pendingCollectTokenId, setPendingCollectTokenId] = useState<bigint | null>(null)

  const { data: dethBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES.dETH as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: dusdcBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES.dUSDC as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
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

  const { data: dethAllowance, refetch: refetchDethAllowance } = useReadContract({
    address: TOKEN_ADDRESSES.dETH as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, NONFUNGIBLE_POSITION_MANAGER as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: dusdcAllowance, refetch: refetchDusdcAllowance } = useReadContract({
    address: TOKEN_ADDRESSES.dUSDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, NONFUNGIBLE_POSITION_MANAGER as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: positionCount, refetch: refetchPositionCount } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  const fetchPositions = useCallback(async () => {
    if (!address || !publicClient || !positionCount || positionCount === 0n) {
      setPositions([])
      return
    }
    setLoadingPositions(true)
    try {
      const positionPromises: Promise<Position | null>[] = []
      for (let i = 0n; i < positionCount; i++) {
        positionPromises.push(
          (async () => {
            try {
              const tokenId = await publicClient.readContract({
                address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
                abi: POSITION_MANAGER_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, i],
              } as Parameters<typeof publicClient.readContract>[0]) as bigint

              const positionData = await publicClient.readContract({
                address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
                abi: POSITION_MANAGER_ABI,
                functionName: 'positions',
                args: [tokenId],
              } as Parameters<typeof publicClient.readContract>[0]) as readonly [bigint, `0x${string}`, `0x${string}`, `0x${string}`, number, number, number, bigint, bigint, bigint, bigint, bigint]

              return {
                tokenId,
                liquidity: positionData[7],
                token0: positionData[2],
                token1: positionData[3],
                fee: positionData[4],
                tickLower: positionData[5],
                tickUpper: positionData[6],
                tokensOwed0: positionData[10],
                tokensOwed1: positionData[11],
              }
            } catch { return null }
          })(),
        )
      }
      const fetched = (await Promise.all(positionPromises)).filter((p): p is Position => p !== null)
      setPositions(fetched)
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoadingPositions(false)
    }
  }, [address, publicClient, positionCount])

  useEffect(() => { fetchPositions() }, [fetchPositions])

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

  const isDethToken0 = token0Address?.toLowerCase() === TOKEN_ADDRESSES.dETH.toLowerCase()

  const handleDethChange = (value: string) => {
    setDethAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value)) && currentPrice > 0)
      setDusdcAmount((Number.parseFloat(value) * currentPrice).toFixed(2))
    else setDusdcAmount('')
  }

  const handleDusdcChange = (value: string) => {
    setDusdcAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value)) && currentPrice > 0)
      setDethAmount((Number.parseFloat(value) / currentPrice).toFixed(6))
    else setDethAmount('')
  }

  useEffect(() => {
    if (isSuccess) {
      toast.dismiss('approve'); toast.dismiss('add-liquidity'); toast.dismiss('close-position'); toast.dismiss('collect')

      if (pendingCollectTokenId !== null) {
        writeContract({
          address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
          abi: POSITION_MANAGER_ABI,
          functionName: 'collect',
          args: [{
            tokenId: pendingCollectTokenId,
            recipient: address!,
            amount0Max: BigInt('0xffffffffffffffffffffffffffffffff'),
            amount1Max: BigInt('0xffffffffffffffffffffffffffffffff'),
          }],
          chain: sepolia,
          account: address,
        })
        toast.loading('Collecting tokens...', { id: 'collect' })
        setPendingCollectTokenId(null)
        return
      }

      if (isClosingPosition) {
        toast.success('Position closed successfully!')
        setIsClosingPosition(false)
        setClosingPositionId(null)
      } else {
        toast.success('Transaction confirmed!')
      }

      refetchDethAllowance(); refetchDusdcAllowance(); refetchPositionCount()
      reset(); setDethAmount(''); setDusdcAmount('')
      setTimeout(() => { fetchPositions() }, 2000)
    }
  }, [isSuccess, reset, fetchPositions, pendingCollectTokenId, isClosingPosition, address])

  const dethAmountBN = dethAmount ? parseUnits(dethAmount, TOKEN_DECIMALS.dETH) : 0n
  const dusdcAmountBN = dusdcAmount ? parseUnits(dusdcAmount, TOKEN_DECIMALS.dUSDC) : 0n
  const needsDethApproval = dethAmountBN > 0n && (dethAllowance ?? 0n) < dethAmountBN
  const needsDusdcApproval = dusdcAmountBN > 0n && (dusdcAllowance ?? 0n) < dusdcAmountBN

  const handleApproveDeth = () => {
    writeContract({ address: TOKEN_ADDRESSES.dETH as `0x${string}`, abi: ERC20_ABI, functionName: 'approve', args: [NONFUNGIBLE_POSITION_MANAGER as `0x${string}`, dethAmountBN], chain: sepolia, account: address })
    toast.loading('Approving dETH...', { id: 'approve' })
  }

  const handleApproveDusdc = () => {
    writeContract({ address: TOKEN_ADDRESSES.dUSDC as `0x${string}`, abi: ERC20_ABI, functionName: 'approve', args: [NONFUNGIBLE_POSITION_MANAGER as `0x${string}`, dusdcAmountBN], chain: sepolia, account: address })
    toast.loading('Approving dUSDC...', { id: 'approve' })
  }

  const handleAddLiquidity = () => {
    if (!address || dethAmountBN === 0n || dusdcAmountBN === 0n) return
    const amount0Desired = isDethToken0 ? dethAmountBN : dusdcAmountBN
    const amount1Desired = isDethToken0 ? dusdcAmountBN : dethAmountBN
    const token0 = isDethToken0 ? TOKEN_ADDRESSES.dETH : TOKEN_ADDRESSES.dUSDC
    const token1 = isDethToken0 ? TOKEN_ADDRESSES.dUSDC : TOKEN_ADDRESSES.dETH
    writeContract({
      address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`, abi: POSITION_MANAGER_ABI, functionName: 'mint',
      args: [{
        token0: token0 as `0x${string}`, token1: token1 as `0x${string}`, fee: POOL_FEE,
        tickLower: MIN_TICK, tickUpper: MAX_TICK, amount0Desired, amount1Desired,
        amount0Min: applySlippage(amount0Desired), amount1Min: applySlippage(amount1Desired),
        recipient: address, deadline: BigInt(Math.floor(Date.now() / 1000) + 1800),
      }],
      chain: sepolia, account: address,
    })
    toast.loading('Adding liquidity...', { id: 'add-liquidity' })
  }

  const handleClosePosition = async (position: Position) => {
    if (!address || position.liquidity === 0n) return
    setClosingPositionId(position.tokenId); setIsClosingPosition(true); setPendingCollectTokenId(position.tokenId)
    try {
      writeContract({
        address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`, abi: POSITION_MANAGER_ABI, functionName: 'decreaseLiquidity',
        args: [{ tokenId: position.tokenId, liquidity: position.liquidity, amount0Min: 1n, amount1Min: 1n, deadline: BigInt(Math.floor(Date.now() / 1000) + 1800) }],
        chain: sepolia, account: address,
      })
      toast.loading('Removing liquidity...', { id: 'close-position' })
    } catch (error) {
      console.error('Error closing position:', error)
      toast.error('Failed to close position')
      setClosingPositionId(null); setIsClosingPosition(false); setPendingCollectTokenId(null)
    }
  }

  const isValidAmount = dethAmount && Number.parseFloat(dethAmount) > 0 && dusdcAmount && Number.parseFloat(dusdcAmount) > 0
  const isAddLiquidityLoading = (isPending || isConfirming) && !isClosingPosition

  const getButtonState = () => {
    if (!isConnected) return { text: 'Connect Wallet', disabled: true, action: undefined }
    if (!isValidAmount) return { text: 'Enter amounts', disabled: true, action: undefined }
    if (needsDethApproval) return { text: 'Approve dETH', disabled: false, action: handleApproveDeth }
    if (needsDusdcApproval) return { text: 'Approve dUSDC', disabled: false, action: handleApproveDusdc }
    return { text: 'Add Liquidity', disabled: false, action: handleAddLiquidity }
  }

  const buttonState = getButtonState()
  const activePositions = positions.filter(p => p.liquidity > 0n)

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8 animate-fade-up">
            <SectionHeader
              title="Liquidity"
              as="h1"
              description="Provide liquidity to the dETH/dUSDC pool to earn fees"
            />
            <StatusBadge variant="testnet" label="Sepolia" />
          </div>

          {/* Wrong network guard */}
          {isConnected && !isOnSepolia && (
            <div className="mb-6">
              <NetworkGuardBanner expectedNetwork="Sepolia" isWrongNetwork={true} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up stagger-1">

            {/* ── Add Liquidity ─────────────────────────────────────────────── */}
            <div className="rounded-lg border border-border bg-surface-1">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <Plus className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Add Liquidity</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">dETH / dUSDC Pool · 0.3% Fee Tier</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-4">

                {/* Current price */}
                <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-4 py-2.5 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  <span>
                    Current Price:{' '}
                    <span className="text-foreground font-mono">
                      1 dETH = {currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} dUSDC
                    </span>
                  </span>
                </div>

                {/* Inputs */}
                <LiquidityInput
                  label="dETH Amount"
                  value={dethAmount}
                  onChange={handleDethChange}
                  onMax={() => dethBalance && handleDethChange(formatUnits(dethBalance.value, 18))}
                  balanceLabel={`Balance: ${dethBalance ? formatAmount(dethBalance.value, 18, 4) : '0'}`}
                  approvalNote={needsDethApproval && dethAmountBN > 0n}
                />
                <LiquidityInput
                  label="dUSDC Amount"
                  value={dusdcAmount}
                  onChange={handleDusdcChange}
                  onMax={() => dusdcBalance && handleDusdcChange(formatUnits(dusdcBalance.value, 6))}
                  balanceLabel={`Balance: ${dusdcBalance ? formatAmount(dusdcBalance.value, 6, 2) : '0'}`}
                  approvalNote={needsDusdcApproval && dusdcAmountBN > 0n}
                />

                {/* Position preview */}
                {isValidAmount && (
                  <div className="rounded-md border border-border bg-surface-2 px-4 py-3 space-y-2.5">
                    <p className="text-xs font-medium text-foreground">Position Preview</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      {[
                        { label: 'Pair', value: 'dETH/dUSDC' },
                        { label: 'Fee Tier', value: '0.3%' },
                        { label: 'Range', value: 'Full Range' },
                        {
                          label: 'Total Value',
                          value: `~$${((Number.parseFloat(dethAmount || '0') * currentPrice) + Number.parseFloat(dusdcAmount || '0')).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                        },
                      ].map(row => (
                        <div key={row.label}>
                          <span className="text-muted-foreground">{row.label}</span>
                          <p className="font-data font-medium text-foreground mt-0.5">{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={buttonState.action}
                  disabled={buttonState.disabled || isAddLiquidityLoading || isClosingPosition}
                  className={cn(
                    'w-full h-10 rounded-md text-sm font-semibold',
                    'inline-flex items-center justify-center gap-2',
                    'transition-all duration-150 cursor-pointer',
                    !buttonState.disabled && !isAddLiquidityLoading && !isClosingPosition
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                      : 'bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                  )}
                >
                  {isAddLiquidityLoading && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />}
                  {isAddLiquidityLoading ? 'Processing...' : buttonState.text}
                </button>
              </div>
            </div>

            {/* ── Your Positions ────────────────────────────────────────────── */}
            <div className="rounded-lg border border-border bg-surface-1">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">Your Positions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activePositions.length > 0
                    ? `${activePositions.length} active position${activePositions.length !== 1 ? 's' : ''}`
                    : 'No positions yet'}
                </p>
              </div>
              <div className="px-5 py-4">
                {!isConnected ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-3 border border-border">
                      <Wallet className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-muted-foreground">Connect wallet to view positions</p>
                  </div>
                ) : loadingPositions ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
                    <p className="text-sm text-muted-foreground">Loading positions...</p>
                  </div>
                ) : activePositions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <p className="text-sm text-muted-foreground">No active positions</p>
                    <p className="text-xs text-muted-foreground/60">Add liquidity to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                    {activePositions.map(position => {
                      const isClosing = closingPositionId === position.tokenId
                      return (
                        <div
                          key={position.tokenId.toString()}
                          className="rounded-md border border-border bg-surface-2 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">dETH/dUSDC</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-muted-foreground bg-surface-3 border border-border rounded px-2 py-0.5">
                                {position.fee / 10000}%
                              </span>
                              <span className="text-[11px] font-mono text-success bg-success/8 border border-success/20 rounded px-2 py-0.5">
                                Active
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Token ID</span>
                              <p className="font-mono text-foreground mt-0.5">#{position.tokenId.toString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Range</span>
                              <p className="font-mono text-foreground mt-0.5">
                                {position.tickLower === MIN_TICK && position.tickUpper === MAX_TICK
                                  ? 'Full Range'
                                  : `${position.tickLower} – ${position.tickUpper}`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleClosePosition(position)}
                            disabled={isClosing || isClosingPosition}
                            className={cn(
                              'w-full h-9 rounded-md text-sm font-medium border',
                              'inline-flex items-center justify-center gap-1.5',
                              'transition-all duration-150 cursor-pointer',
                              !isClosing && !isClosingPosition
                                ? 'border-destructive/30 bg-destructive/8 text-destructive hover:bg-destructive/15 active:scale-[0.98]'
                                : 'border-border bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                            )}
                          >
                            {isClosing ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />Closing...</>
                            ) : (
                              <><X className="h-3.5 w-3.5" strokeWidth={1.5} />Close Position</>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pool info strip */}
          <div className="mt-4 rounded-lg border border-border bg-surface-1 px-5 py-4 animate-fade-up stagger-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground/60 mb-3">Pool Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Pool Address', value: POOL_ADDRESS, mono: true, truncate: true },
                { label: 'Fee Tier', value: '0.3%', mono: false, truncate: false },
                { label: 'Current Price', value: `1 dETH = ${currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} dUSDC`, mono: false, truncate: false },
                { label: 'Network', value: 'Sepolia Testnet', mono: false, truncate: false },
              ].map(item => (
                <div key={item.label}>
                  <span className="text-muted-foreground">{item.label}</span>
                  <p className={cn('text-foreground mt-0.5', item.mono && 'font-mono', item.truncate && 'truncate')}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
