'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  Loader2,
  ExternalLink,
  Lock,
  Zap,
  Users,
  ShieldOff,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
  useSimulateContract,
  useConnect,
} from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { base } from 'wagmi/chains'
import { PageLayout } from '@/components/page-layout'
import { MainnetWarning } from '@/components/ui/mainnet-warning'
import { StatusBadge } from '@/components/ui/status-badge'
import { TransactionStatus, type TxState } from '@/components/ui/transaction-status'
import { cn } from '@/lib/utils'
import { GENESIS_NFT_ADDRESS, GENESIS_NFT_ABI, GENESIS_NFT_CONFIG } from '@/lib/genesis-config'

// ─── Mint state machine ───────────────────────────────────────────────────────

type MintPhase = 'idle' | 'simulating' | 'minting' | 'confirming' | 'minted'

// ─── Trait pill ───────────────────────────────────────────────────────────────

function TraitPill({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  sub: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border/60 bg-card/60 px-4 py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-amber-500/10 border border-amber-500/20">
        <Icon className="h-4 w-4 text-amber-400" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

// ─── Supply bar ───────────────────────────────────────────────────────────────

function SupplyBar({ minted, max }: { minted: number; max: number }) {
  const pct = Math.min((minted / max) * 100, 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-mono">Minted</span>
        <span className="font-data text-foreground">
          {minted.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-500 transition-all duration-700"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={minted}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${minted} of ${max} Genesis Passes minted`}
        />
      </div>
      <p className="text-[11px] text-muted-foreground font-mono text-right">
        {(100 - pct).toFixed(1)}% remaining
      </p>
    </div>
  )
}

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: React.ReactNode
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm font-data font-medium',
          highlight ? 'text-amber-400' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Mint button label ────────────────────────────────────────────────────────

function MintButtonLabel({
  isConnected,
  isCorrectNetwork,
  alreadyMinted,
  isSoldOut,
  hasEnoughETH,
  mintPhase,
  isSimulating,
  simulateError,
  simulateData,
}: {
  isConnected: boolean
  isCorrectNetwork: boolean
  alreadyMinted: boolean
  isSoldOut: boolean
  hasEnoughETH: boolean
  mintPhase: MintPhase
  isSimulating: boolean
  simulateError: Error | null
  simulateData: unknown
}) {
  if (!isConnected) return <>Connect wallet</>
  if (!isCorrectNetwork) return <>Switch to Base Mainnet</>
  if (alreadyMinted) return <><CheckCircle2 className="h-4 w-4 mr-2" strokeWidth={1.5} />Already minted</>
  if (isSoldOut) return <>Sold out</>
  if (!hasEnoughETH) return <>Insufficient ETH on Base</>
  if (mintPhase === 'minting') return <><Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} />Waiting for wallet...</>
  if (mintPhase === 'confirming') return <><Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} />Confirming on Base...</>
  if (mintPhase === 'minted') return <><CheckCircle2 className="h-4 w-4 mr-2" strokeWidth={1.5} />Minted</>
  if (isSimulating) return <><Loader2 className="h-4 w-4 mr-2 animate-spin" strokeWidth={1.5} />Checking...</>
  if (simulateError && !simulateData) return <>Mint unavailable</>
  return <>Mint Genesis Pass</>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GenesisPassPage() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors } = useConnect()
  const [mintPhase, setMintPhase] = useState<MintPhase>('idle')
  const [txStatus, setTxStatus] = useState<TxState>('idle')
  const [txErrorMsg, setTxErrorMsg] = useState<string | undefined>()
  const [successMsg, setSuccessMsg] = useState<string | undefined>()

  const isCorrectNetwork = chain?.id === base.id

  // ETH balance on Base
  const { data: ethBalance } = useBalance({
    address,
    chainId: base.id,
  })

  // On-chain supply
  const {
    data: totalSupply,
    isLoading: isLoadingSupply,
    refetch: refetchSupply,
  } = useReadContract({
    address: GENESIS_NFT_ADDRESS,
    abi: GENESIS_NFT_ABI,
    functionName: 'totalSupply',
    chainId: base.id,
    query: { refetchInterval: 8000 },
  })

  // User balance
  const {
    data: userBalance,
    isLoading: isLoadingBalance,
    refetch: refetchBalance,
  } = useReadContract({
    address: GENESIS_NFT_ADDRESS,
    abi: GENESIS_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: !!address, refetchInterval: 12000 },
  })

  const maxSupply = GENESIS_NFT_CONFIG.maxSupply
  const minted = totalSupply ? Number(totalSupply) : 0
  const remaining = maxSupply - minted
  const isSoldOut = remaining <= 0
  const alreadyMinted = userBalance !== undefined && userBalance > 0n
  const hasEnoughETH =
    ethBalance !== undefined &&
    ethBalance.value >= parseEther(GENESIS_NFT_CONFIG.totalPrice)

  const canMint =
    isConnected &&
    isCorrectNetwork &&
    !alreadyMinted &&
    !isSoldOut &&
    hasEnoughETH &&
    mintPhase === 'idle'

  // Simulation -- only fires when all preconditions pass
  const {
    data: simulateData,
    error: simulateError,
    isLoading: isSimulating,
  } = useSimulateContract(
    canMint && address
      ? {
          address: GENESIS_NFT_ADDRESS as `0x${string}`,
          abi: GENESIS_NFT_ABI,
          functionName: 'mint',
          args: [1n],
          value: parseEther(GENESIS_NFT_CONFIG.totalPrice),
          chainId: base.id,
          account: address,
        }
      : undefined,
  )

  const {
    writeContract,
    data: mintTxHash,
    isPending: isMintPending,
    reset: resetMint,
    error: mintError,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash: mintTxHash })

  // Sync mint phase with wagmi state
  useEffect(() => {
    if (isMintPending) {
      setMintPhase('minting')
      setTxStatus('pending')
    } else if (isConfirming) {
      setMintPhase('confirming')
      setTxStatus('confirming')
    } else if (isConfirmed && receipt?.status === 'success') {
      setMintPhase('minted')
      setTxStatus('success')
      setSuccessMsg('Genesis Pass minted. You are now an early supporter of Altera.')
      toast.success('Genesis Pass minted', { description: 'Welcome to Altera early access' })
      refetchSupply()
      refetchBalance()
    } else if (mintError) {
      setMintPhase('idle')
      const msg = mintError.message.toLowerCase()
      if (msg.includes('user rejected') || msg.includes('user denied')) {
        setTxStatus('rejected')
      } else if (msg.includes('already minted') || msg.includes('max per wallet')) {
        setTxStatus('reverted')
        setTxErrorMsg('You already own a Genesis Pass (1 per wallet).')
      } else if (msg.includes('sold out') || msg.includes('max supply')) {
        setTxStatus('reverted')
        setTxErrorMsg('All passes have been minted.')
      } else {
        setTxStatus('reverted')
        setTxErrorMsg('The contract rejected this transaction.')
      }
    }
  }, [isMintPending, isConfirming, isConfirmed, receipt, mintError, refetchSupply, refetchBalance])

  // Dismiss loading toast on completion
  useEffect(() => {
    if (isConfirmed || mintError) toast.dismiss('mint-tx')
  }, [isConfirmed, mintError])

  const isButtonDisabled =
    (isConnected &&
      (!isCorrectNetwork ||
        alreadyMinted ||
        isSoldOut ||
        !hasEnoughETH)) ||
    mintPhase === 'minting' ||
    mintPhase === 'confirming' ||
    mintPhase === 'minted' ||
    (canMint && isSimulating) ||
    (canMint && !!simulateError && !simulateData)

  const handleClick = () => {
    if (!isConnected) {
      const injected = connectors.find(c => c.id === 'injected') ?? connectors[0]
      if (injected) connect({ connector: injected })
      return
    }
    if (!canMint || !address || !simulateData?.request) return
    try {
      writeContract(simulateData.request)
      toast.loading('Transaction submitted', {
        description: 'Waiting for confirmation on Base...',
        id: 'mint-tx',
      })
    } catch {
      setMintPhase('idle')
    }
  }

  const handleResetTx = () => {
    setTxStatus('idle')
    setTxErrorMsg(undefined)
    setSuccessMsg(undefined)
    if (mintPhase !== 'minted') {
      setMintPhase('idle')
      resetMint()
    }
  }

  const ethBalanceDisplay =
    ethBalance
      ? `${parseFloat(formatEther(ethBalance.value)).toFixed(5)} ETH`
      : 'unavailable'

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">

          {/* ── Mandatory mainnet warning ── */}
          <MainnetWarning
            detail={`You need at least ${GENESIS_NFT_CONFIG.totalPrice} ETH on Base Mainnet to mint. This is not a testnet transaction.`}
            className="mb-8"
          />

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* ══ Left: NFT + description ══════════════════════════════════════ */}
            <div className="space-y-6">

              {/* NFT preview */}
              <div className="relative aspect-square rounded-xl overflow-hidden border border-border/60 bg-zinc-900">
                <Image
                  src="/genesis-pass.png"
                  alt="Altera Genesis Pass NFT"
                  fill
                  className="object-contain p-4"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Soulbound badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1.5 rounded px-2.5 py-1 bg-zinc-900/90 border border-zinc-700/60 text-[11px] font-mono uppercase tracking-wide text-zinc-400 backdrop-blur-sm">
                    <Lock className="h-3 w-3" strokeWidth={1.5} />
                    Soulbound
                  </span>
                </div>
              </div>

              {/* Title + copy */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    Altera Genesis Pass
                  </h1>
                  <StatusBadge variant="mainnet" label="Base Mainnet" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[52ch]">
                  A soulbound NFT marking early supporters of the Altera protocol.
                  Non-transferable. One per wallet. Issued on Base Mainnet.
                  Contracts are unaudited.
                </p>
              </div>

              {/* Trait pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TraitPill
                  icon={Lock}
                  label="Soulbound"
                  sub="Non-transferable. Stays in your wallet."
                />
                <TraitPill
                  icon={Zap}
                  label="Early access"
                  sub="Priority access to new protocol features."
                />
                <TraitPill
                  icon={Users}
                  label="Limited supply"
                  sub={`${maxSupply.toLocaleString()} passes total. No future batches planned.`}
                />
                <TraitPill
                  icon={ShieldOff}
                  label="Unaudited"
                  sub="Contract is unaudited. Use at your own risk."
                />
              </div>
            </div>

            {/* ══ Right: Mint panel ═════════════════════════════════════════════ */}
            <div className="lg:sticky lg:top-20 space-y-4">

              {/* Wrong network inline alert */}
              {isConnected && !isCorrectNetwork && (
                <div className="flex items-start gap-3 rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" strokeWidth={1.5} />
                  <p className="text-sm text-amber-400/90">
                    Switch to <strong className="text-amber-400">Base Mainnet</strong> in your wallet to mint.
                  </p>
                </div>
              )}

              {/* Mint card */}
              <div className="rounded-xl border border-border bg-card">

                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Mint Genesis Pass</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Limited to {maxSupply.toLocaleString()} total
                    </p>
                  </div>
                  <StatusBadge variant="mainnet" label="Base" />
                </div>

                {/* Card body */}
                <div className="px-5 py-5 space-y-5">

                  {/* Detail rows */}
                  <div>
                    <DetailRow label="Price" value={`${GENESIS_NFT_CONFIG.price} ETH`} />
                    <DetailRow label="Protocol fee" value={`${GENESIS_NFT_CONFIG.protocolFee} ETH`} />
                    <DetailRow
                      label="Remaining"
                      value={
                        isLoadingSupply ? (
                          <span className="inline-block h-4 w-16 rounded skeleton-shimmer" />
                        ) : (
                          `${remaining.toLocaleString()} / ${maxSupply.toLocaleString()}`
                        )
                      }
                    />
                    <DetailRow label="Quantity" value="1 (max per wallet)" />
                    <DetailRow label="Network" value="Base Mainnet" />
                    {isConnected && (
                      <DetailRow
                        label="Your ETH balance"
                        value={ethBalanceDisplay}
                        highlight={!hasEnoughETH && !!ethBalance}
                      />
                    )}
                  </div>

                  {/* Supply bar */}
                  {!isLoadingSupply && (
                    <SupplyBar minted={minted} max={maxSupply} />
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between rounded-md border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                    <span className="text-sm font-medium text-foreground">Total</span>
                    <span className="font-data text-lg font-semibold text-amber-400">
                      {GENESIS_NFT_CONFIG.totalPrice} ETH
                    </span>
                  </div>

                  {/* Mint button */}
                  <button
                    type="button"
                    onClick={handleClick}
                    disabled={isButtonDisabled}
                    className={cn(
                      'w-full h-11 rounded-md text-sm font-semibold',
                      'inline-flex items-center justify-center gap-2',
                      'transition-all duration-150 cursor-pointer',
                      'focus-visible:outline-2 focus-visible:outline-amber-400 focus-visible:outline-offset-2',
                      !isButtonDisabled
                        ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 active:scale-[0.98]'
                        : 'bg-zinc-800 text-zinc-500 cursor-not-allowed',
                    )}
                    aria-label="Mint Genesis Pass"
                  >
                    <MintButtonLabel
                      isConnected={isConnected}
                      isCorrectNetwork={isCorrectNetwork}
                      alreadyMinted={alreadyMinted}
                      isSoldOut={isSoldOut}
                      hasEnoughETH={hasEnoughETH}
                      mintPhase={mintPhase}
                      isSimulating={isSimulating}
                      simulateError={simulateError as Error | null}
                      simulateData={simulateData}
                    />
                  </button>

                  {/* Transaction status */}
                  <TransactionStatus
                    state={txStatus}
                    successMessage={successMsg}
                    txHash={mintTxHash}
                    explorer="base"
                    errorMessage={txErrorMsg}
                    onReset={handleResetTx}
                  />

                  {/* Contextual sub-messages */}
                  {mintPhase === 'idle' && !txStatus.match(/success|failed|reverted|rejected/) && (
                    <>
                      {alreadyMinted && (
                        <p className="text-center text-xs text-muted-foreground">
                          You already hold a Genesis Pass.
                        </p>
                      )}
                      {isConnected && isCorrectNetwork && canMint && simulateError && !simulateData && (
                        <p className="text-center text-xs text-red-400">
                          Mint simulation failed. Transaction would revert on-chain.
                        </p>
                      )}
                      {isConnected && isCorrectNetwork && !alreadyMinted && !isSoldOut && !hasEnoughETH && !!ethBalance && (
                        <p className="text-center text-xs text-amber-400/80">
                          You need {GENESIS_NFT_CONFIG.totalPrice} ETH on Base to mint.
                        </p>
                      )}
                      {mintPhase === 'idle' && isConnected && isCorrectNetwork && canMint && !simulateError && (
                        <p className="text-center text-xs text-muted-foreground">
                          By minting you agree to hold a non-transferable Genesis Pass.
                          Contracts are unaudited.
                        </p>
                      )}
                    </>
                  )}

                  {/* Success: dashboard link */}
                  {mintPhase === 'minted' && (
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      View your Genesis badge in Dashboard
                      <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                    </Link>
                  )}
                </div>
              </div>

              {/* Basescan link */}
              <a
                href={`https://basescan.org/address/${GENESIS_NFT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-150 cursor-pointer"
              >
                View contract on Basescan
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
