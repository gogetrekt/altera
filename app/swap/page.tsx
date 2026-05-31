'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowDownUp, ChevronDown, Settings, TriangleAlert, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { parseUnits, formatUnits } from 'viem'
import {
  useAccount,
  useBalance,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { PageLayout } from '@/components/page-layout'
import { NetworkGuardBanner } from '@/components/ui/network-guard-banner'
import { StatusBadge } from '@/components/ui/status-badge'
import { SectionHeader } from '@/components/ui/section-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SIMPLE_SWAP_ADDRESS,
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
  ERC20_ABI,
  SIMPLE_SWAP_ABI,
} from '@/lib/uniswap-config'
import { cn } from '@/lib/utils'

const tokens = [
  { symbol: 'dETH', name: 'Dummy Ethereum', address: TOKEN_ADDRESSES.dETH },
  { symbol: 'dUSDC', name: 'Dummy USD Coin', address: TOKEN_ADDRESSES.dUSDC },
]

const slippageOptions = ['0.1%', '0.5%', '1.0%']

const formatAmount = (value: string, maxDecimals = 6): string => {
  if (!value) return ''
  const num = Number.parseFloat(value)
  if (num === 0) return '0'
  if (num < 0.000001) return num.toExponential(2)
  return num.toFixed(maxDecimals).replace(/\.?0+$/, '')
}

export default function SwapPage() {
  const { address, chain, isConnected } = useAccount()
  const isOnSepolia = !chain || chain.id === sepolia.id
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [fromAmount, setFromAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5%')
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | null>(null)
  const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | null>(null)
  const processedSwapRef = useRef<string | null>(null)

  const { data: fromTokenBalance } = useBalance({
    address,
    token: fromToken.address as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: toTokenBalance } = useBalance({
    address,
    token: toToken.address as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, SIMPLE_SWAP_ADDRESS as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address, refetchInterval: 3000 },
  })

  const { data: swapRate } = useReadContract({
    address: SIMPLE_SWAP_ADDRESS as `0x${string}`,
    abi: SIMPLE_SWAP_ABI,
    functionName: 'rate',
    chainId: sepolia.id,
  })

  const rate = swapRate ? Number(swapRate) : 2953

  const sanitizedFromAmount = fromAmount.replace(/[^\d.]/g, '')
  const fromAmountInWei = sanitizedFromAmount
    ? parseUnits(sanitizedFromAmount, TOKEN_DECIMALS[fromToken.symbol as keyof typeof TOKEN_DECIMALS])
    : 0n

  const needsApproval =
    fromAmountInWei > 0n &&
    allowance !== undefined &&
    allowance < fromAmountInWei

  const toAmountInWei =
    sanitizedFromAmount && fromAmountInWei > 0n
      ? fromToken.symbol === 'dETH'
        ? (fromAmountInWei * BigInt(rate)) / 10n ** 12n
        : (fromAmountInWei * 10n ** 12n) / BigInt(rate)
      : 0n

  const toAmountRaw =
    toAmountInWei > 0n && fromAmount
      ? formatUnits(toAmountInWei, TOKEN_DECIMALS[toToken.symbol as keyof typeof TOKEN_DECIMALS])
      : ''

  const toAmount = formatAmount(toAmountRaw, 6)

  const minimumReceived =
    toAmountRaw && slippage
      ? formatAmount(
          (Number.parseFloat(toAmountRaw) * (1 - Number.parseFloat(slippage) / 100)).toString(),
          6,
        )
      : ''

  const switchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount('')
  }

  const { data: approveSimulation } = useSimulateContract(
    address && needsApproval && fromAmountInWei > 0n
      ? {
          account: address,
          address: fromToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [SIMPLE_SWAP_ADDRESS as `0x${string}`, fromAmountInWei],
        }
      : undefined,
  )

  const swapFunctionName = fromToken.symbol === 'dETH' ? 'swapETHForUSDC' : 'swapUSDCForETH'

  const { data: swapSimulation } = useSimulateContract(
    address && !needsApproval && fromAmountInWei > 0n
      ? {
          account: address,
          address: SIMPLE_SWAP_ADDRESS as `0x${string}`,
          abi: SIMPLE_SWAP_ABI,
          functionName: swapFunctionName,
          args: [fromAmountInWei],
        }
      : undefined,
  )

  const { writeContractAsync: writeApprove } = useWriteContract()
  const { writeContractAsync: writeSwap } = useWriteContract()

  const { data: approvalReceipt, isLoading: isApprovalPending } = useWaitForTransactionReceipt({
    hash: approvalTxHash || undefined,
  })

  const { data: swapReceipt, isLoading: isSwapPending } = useWaitForTransactionReceipt({
    hash: swapTxHash || undefined,
  })

  useEffect(() => {
    if (approvalReceipt?.status === 'success') {
      toast.success('Token approved!', { id: 'approve' })
      setApprovalTxHash(null)
      refetchAllowance()
    }
  }, [approvalReceipt, refetchAllowance])

  useEffect(() => {
    if (
      swapReceipt &&
      swapReceipt.status === 'success' &&
      swapReceipt.transactionHash !== processedSwapRef.current
    ) {
      processedSwapRef.current = swapReceipt.transactionHash
      toast.success(
        `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        { id: 'swap' },
      )
      setFromAmount('')
      setSwapTxHash(null)
    }
  }, [swapReceipt, fromAmount, fromToken.symbol, toAmount, toToken.symbol])

  const handleApprove = async () => {
    if (!approveSimulation?.request) { toast.error('Approval not ready.'); return }
    try {
      toast.loading('Approving...', { id: 'approve' })
      const hash = await writeApprove(approveSimulation.request)
      setApprovalTxHash(hash)
    } catch {
      setApprovalTxHash(null)
      toast.error('Approval failed.', { id: 'approve' })
    }
  }

  const handleSwap = async () => {
    if (!swapSimulation?.request) {
      toast.error('Swap not ready. Make sure SimpleSwap contract is deployed and funded.')
      return
    }
    try {
      toast.loading('Swapping...', { id: 'swap' })
      const hash = await writeSwap(swapSimulation.request)
      setSwapTxHash(hash)
    } catch {
      setSwapTxHash(null)
      toast.error('Swap failed.', { id: 'swap' })
    }
  }

  const isValidAmount = fromAmount && Number.parseFloat(fromAmount) > 0
  const isLoading = isApprovalPending || isSwapPending

  return (
    <PageLayout minimalFooter>
      <div className="flex flex-col items-center justify-center min-h-dvh py-12 px-4">

        {/* Wrong network guard */}
        {isConnected && !isOnSepolia && (
          <div className="w-full max-w-md mb-4">
            <NetworkGuardBanner expectedNetwork="Sepolia" isWrongNetwork={true} />
          </div>
        )}

        {/* Swap card */}
        <div className="w-full max-w-md animate-fade-up">
          <div className="rounded-lg border border-border bg-surface-1">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-semibold text-foreground">Swap</h1>
                <StatusBadge variant="testnet" label="Sepolia" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors duration-150 cursor-pointer"
                    aria-label="Slippage settings"
                  >
                    <Settings className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                    Slippage
                  </div>
                  {slippageOptions.map(option => (
                    <DropdownMenuItem
                      key={option}
                      onClick={() => setSlippage(option)}
                      className={cn(slippage === option && 'bg-surface-2')}
                    >
                      <span className="font-mono text-sm">{option}</span>
                      {slippage === option && (
                        <span className="ml-auto text-primary text-xs">active</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Body */}
            <div className="px-5 py-5 space-y-2">

              {/* From token */}
              <div className="rounded-md bg-surface-2 border border-border px-4 py-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>From</span>
                  <span>
                    Balance:{' '}
                    {fromTokenBalance
                      ? formatAmount(formatUnits(fromTokenBalance.value, fromTokenBalance.decimals), 4)
                      : '0'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={e => setFromAmount(e.target.value)}
                    className="flex-1 bg-transparent border-0 text-2xl font-data font-medium text-foreground placeholder:text-muted-foreground/30 focus:outline-none"
                    aria-label={`Amount of ${fromToken.symbol} to swap`}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md bg-surface-3 border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-3/80 transition-colors duration-150 cursor-pointer shrink-0"
                      >
                        {fromToken.symbol}
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {tokens.map(token => (
                        <DropdownMenuItem
                          key={token.symbol}
                          onClick={() => setFromToken(token)}
                          disabled={token.symbol === toToken.symbol}
                        >
                          <span className="font-medium">{token.symbol}</span>
                          <span className="ml-2 text-muted-foreground text-xs">{token.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary/80 transition-colors duration-150 cursor-pointer"
                  onClick={() => {
                    if (fromTokenBalance) setFromAmount(formatUnits(fromTokenBalance.value, fromTokenBalance.decimals))
                  }}
                >
                  Max
                </button>
              </div>

              {/* Switch button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={switchTokens}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-colors duration-150 cursor-pointer"
                  aria-label="Switch tokens"
                >
                  <ArrowDownUp className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* To token */}
              <div className="rounded-md bg-surface-2 border border-border px-4 py-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>To (estimated)</span>
                  <span>
                    Balance:{' '}
                    {toTokenBalance
                      ? formatAmount(formatUnits(toTokenBalance.value, toTokenBalance.decimals), 4)
                      : '0'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-2xl font-data font-medium text-muted-foreground truncate">
                    {toAmount || '0.0'}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-md bg-surface-3 border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface-3/80 transition-colors duration-150 cursor-pointer shrink-0"
                      >
                        {toToken.symbol}
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {tokens.map(token => (
                        <DropdownMenuItem
                          key={token.symbol}
                          onClick={() => setToToken(token)}
                          disabled={token.symbol === fromToken.symbol}
                        >
                          <span className="font-medium">{token.symbol}</span>
                          <span className="ml-2 text-muted-foreground text-xs">{token.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Swap details */}
              {isValidAmount && (
                <div className="rounded-md bg-surface-2/60 border border-border/60 px-4 py-3 space-y-2 mt-1">
                  {[
                    { label: 'Rate', value: `1 dETH = ${rate} dUSDC` },
                    { label: 'Slippage', value: slippage },
                    { label: 'Min. received', value: `${minimumReceived} ${toToken.symbol}` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-mono text-foreground/80">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action button */}
              <button
                type="button"
                onClick={needsApproval ? handleApprove : handleSwap}
                disabled={!isValidAmount || isLoading}
                className={cn(
                  'w-full h-11 rounded-md text-sm font-semibold mt-1',
                  'inline-flex items-center justify-center gap-2',
                  'transition-all duration-150 cursor-pointer',
                  'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
                  isValidAmount && !isLoading
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                    : 'bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                )}
              >
                {isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                )}
                {isApprovalPending
                  ? 'Approving...'
                  : isSwapPending
                  ? 'Swapping...'
                  : needsApproval
                  ? `Approve ${fromToken.symbol}`
                  : 'Swap'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
