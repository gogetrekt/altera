'use client'

import { useState, useEffect, useCallback } from 'react'
import { Droplets, ExternalLink, Clock, Coins, Loader2, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
} from 'wagmi'
import { sepolia } from 'viem/chains'
import Link from 'next/link'
import { PageLayout } from '@/components/page-layout'
import { NetworkGuardBanner } from '@/components/ui/network-guard-banner'
import { StatusBadge } from '@/components/ui/status-badge'
import { SectionHeader } from '@/components/ui/section-header'
import { cn } from '@/lib/utils'
import {
  DETH_FAUCET_ADDRESS,
  DUSDC_FAUCET_ADDRESS,
  FAUCET_ABI,
} from '@/lib/uniswap-config'

const FALLBACK_COOLDOWN = 24 * 60 * 60
const SEPOLIA_CHAIN_ID = 11155111

interface TokenFaucet {
  symbol: string
  name: string
  amount: string
  faucetAddress: `0x${string}`
}

const FAUCETS: TokenFaucet[] = [
  { symbol: 'dETH', name: 'Dummy ETH', amount: '0.005', faucetAddress: DETH_FAUCET_ADDRESS as `0x${string}` },
  { symbol: 'dUSDC', name: 'Dummy USDC', amount: '10', faucetAddress: DUSDC_FAUCET_ADDRESS as `0x${string}` },
]

export default function FaucetPage() {
  const { address, isConnected, chain } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const [claimingToken, setClaimingToken] = useState<string | null>(null)
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))

  const isOnSepolia = chain?.id === SEPOLIA_CHAIN_ID

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(interval)
  }, [])

  const { data: dethLastClaim, refetch: refetchDeth } = useReadContract({
    address: DETH_FAUCET_ADDRESS as `0x${string}`,
    abi: FAUCET_ABI,
    functionName: 'lastClaim',
    args: address ? [address] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  })

  const { data: dusdcLastClaim, refetch: refetchDusdc } = useReadContract({
    address: DUSDC_FAUCET_ADDRESS as `0x${string}`,
    abi: FAUCET_ABI,
    functionName: 'lastClaim',
    args: address ? [address] : undefined,
    chainId: SEPOLIA_CHAIN_ID,
    query: { enabled: !!address },
  })

  const { data: dethCooldownRaw } = useReadContract({
    address: DETH_FAUCET_ADDRESS as `0x${string}`,
    abi: FAUCET_ABI,
    functionName: 'cooldown',
    chainId: SEPOLIA_CHAIN_ID,
  })

  const { data: dusdcCooldownRaw } = useReadContract({
    address: DUSDC_FAUCET_ADDRESS as `0x${string}`,
    abi: FAUCET_ABI,
    functionName: 'cooldown',
    chainId: SEPOLIA_CHAIN_ID,
  })

  const dethCooldownPeriod = dethCooldownRaw !== undefined ? Number(dethCooldownRaw) : FALLBACK_COOLDOWN
  const dusdcCooldownPeriod = dusdcCooldownRaw !== undefined ? Number(dusdcCooldownRaw) : FALLBACK_COOLDOWN

  const { writeContractAsync, isPending: isWritePending, reset: resetWrite } = useWriteContract()
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({ hash: txHash, chainId: SEPOLIA_CHAIN_ID })

  useEffect(() => {
    if (isConfirmed && txHash && claimingToken) {
      toast.dismiss('claim')
      toast.success(`Claimed ${claimingToken} successfully!`)
      refetchDeth(); refetchDusdc()
      setTxHash(undefined); resetWrite(); setClaimingToken(null)
    }
  }, [isConfirmed, txHash, claimingToken, refetchDeth, refetchDusdc, resetWrite])

  useEffect(() => {
    if (isReceiptError && txHash) {
      toast.dismiss('claim')
      toast.error('Transaction reverted on chain')
      setTxHash(undefined); resetWrite(); setClaimingToken(null)
    }
  }, [isReceiptError, txHash, resetWrite])

  const getCooldown = (symbol: string): number => {
    const lastClaim = symbol === 'dETH' ? dethLastClaim : dusdcLastClaim
    if (!lastClaim) return 0
    const cooldownPeriod = symbol === 'dETH' ? dethCooldownPeriod : dusdcCooldownPeriod
    const remaining = Number(lastClaim) + cooldownPeriod - now
    return remaining > 0 ? remaining : 0
  }

  const formatCooldown = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`
  }

  const handleClaim = useCallback(
    async (faucet: TokenFaucet) => {
      if (!address || !isConnected) { toast.error('Please connect your wallet'); return }
      if (claimingToken) return

      if (!isOnSepolia) {
        toast.loading('Switching to Sepolia...', { id: 'claim' })
        try {
          await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })
          await new Promise(r => setTimeout(r, 500))
        } catch {
          toast.dismiss('claim')
          toast.error('Please switch to Sepolia network manually')
          return
        }
      }

      setClaimingToken(faucet.symbol)
      toast.loading(`Claiming ${faucet.symbol}...`, { id: 'claim' })

      try {
        const hash = await writeContractAsync({
          address: faucet.faucetAddress,
          abi: FAUCET_ABI,
          functionName: 'claim',
          chain: sepolia,
          account: address!,
        })
        setTxHash(hash)
        toast.loading(`Confirming ${faucet.symbol}...`, { id: 'claim' })
      } catch (e: unknown) {
        toast.dismiss('claim')
        const msg = (e as Error)?.message ?? ''
        if (msg.includes('User rejected') || msg.includes('User denied') || msg.includes('rejected'))
          toast.error('Transaction cancelled')
        else if (msg.includes('Cooldown') || msg.includes('cooldown'))
          toast.error('Cooldown not expired yet (24h)')
        else if (msg.includes('insufficient funds'))
          toast.error('Insufficient Sepolia ETH for gas')
        else { toast.error('Claim failed — check console'); console.error('Claim error:', e) }
        resetWrite(); setClaimingToken(null)
      }
    },
    [address, isConnected, isOnSepolia, claimingToken, switchChainAsync, writeContractAsync, resetWrite],
  )

  const isLoading = isWritePending || isConfirming || !!txHash

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl">

          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <div className="flex items-center gap-3 mb-1">
              <SectionHeader title="Faucet" as="h1" />
              <StatusBadge variant="testnet" label="Sepolia" />
            </div>
            <p className="text-sm text-muted-foreground">Get testnet tokens to try Altera</p>
            <Link
              href="/faucet/troubleshoot"
              className="text-xs text-primary hover:text-primary/80 transition-colors duration-150 mt-2 inline-block"
            >
              Having issues? → Troubleshooting guide
            </Link>
          </div>

          {/* Wrong network guard */}
          {isConnected && !isOnSepolia && (
            <div className="mb-6">
              <NetworkGuardBanner expectedNetwork="Sepolia" isWrongNetwork={true} />
            </div>
          )}

          <div className="space-y-4 animate-fade-up stagger-1">

            {/* Sepolia ETH card */}
            <div className="rounded-lg border border-border bg-surface-1">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <Droplets className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Sepolia ETH (Gas)</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Required for transaction fees on Sepolia testnet
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-start gap-3 rounded-md border border-border bg-surface-2 px-4 py-3">
                  <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sepolia ETH is required for gas fees. Get some from an official faucet before using Altera.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-md border border-border bg-surface-2 text-sm text-foreground hover:bg-surface-3 transition-colors duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Google Cloud Faucet
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" strokeWidth={1.5} />
                  </a>
                  <a
                    href="https://www.alchemy.com/faucets/ethereum-sepolia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 h-9 rounded-md border border-border bg-surface-2 text-sm text-foreground hover:bg-surface-3 transition-colors duration-150 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Alchemy Faucet
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </div>

            {/* Test tokens card */}
            <div className="rounded-lg border border-border bg-surface-1">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <Coins className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Test Tokens</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Claim once per cooldown period
                  </p>
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FAUCETS.map(faucet => {
                    const cooldown = getCooldown(faucet.symbol)
                    const isClaiming = claimingToken === faucet.symbol
                    const isOnCooldown = cooldown > 0

                    return (
                      <div
                        key={faucet.symbol}
                        className="rounded-md border border-border bg-surface-2 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{faucet.symbol}</p>
                            <p className="text-xs text-muted-foreground">{faucet.name}</p>
                          </div>
                          <span className="text-xs font-mono text-muted-foreground bg-surface-3 border border-border rounded px-2 py-0.5">
                            {faucet.amount} / claim
                          </span>
                        </div>

                        {/* Cooldown timer */}
                        {isOnCooldown && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                            <span className="font-mono">{formatCooldown(cooldown)}</span>
                          </div>
                        )}

                        {/* Claim button */}
                        {!isConnected ? (
                          <button disabled className="w-full h-9 rounded-md bg-surface-3 text-muted-foreground/40 text-sm cursor-not-allowed">
                            Connect Wallet
                          </button>
                        ) : isOnCooldown ? (
                          <button disabled className="w-full h-9 rounded-md bg-surface-3 text-muted-foreground/40 text-sm cursor-not-allowed inline-flex items-center justify-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Cooldown active
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleClaim(faucet)}
                            disabled={isLoading}
                            className={cn(
                              'w-full h-9 rounded-md text-sm font-medium',
                              'inline-flex items-center justify-center gap-1.5',
                              'transition-all duration-150 cursor-pointer',
                              !isLoading
                                ? 'bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]'
                                : 'bg-surface-3 text-muted-foreground/40 cursor-not-allowed',
                            )}
                          >
                            {isClaiming && isLoading && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                            )}
                            {isClaiming && isLoading ? 'Claiming...' : `Claim ${faucet.symbol}`}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* About card */}
            <div className="rounded-lg border border-border bg-surface-1 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-primary font-semibold font-mono">i</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">About Test Tokens</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    dETH and dUSDC are ERC-20 tokens deployed on Sepolia for testing purposes.
                    They have no real value and are only used to test Altera protocol features.
                    You can claim tokens once every 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
