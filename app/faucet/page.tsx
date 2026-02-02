"use client"

import { useState, useEffect, useCallback } from "react"
import { Droplets, ExternalLink, Clock, Coins } from "lucide-react"
import { toast } from "sonner"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi"
import { sepolia } from "viem/chains"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  DETH_FAUCET_ADDRESS,
  DUSDC_FAUCET_ADDRESS,
  FAUCET_ABI,
} from "@/lib/uniswap-config"

const COOLDOWN_PERIOD = 24 * 60 * 60
const SEPOLIA_CHAIN_ID = 11155111

interface TokenFaucet {
  symbol: string
  name: string
  amount: string
  faucetAddress: `0x${string}`
}

const FAUCETS: TokenFaucet[] = [
  { symbol: "dETH", name: "Dummy ETH", amount: "0.005", faucetAddress: DETH_FAUCET_ADDRESS as `0x${string}` },
  { symbol: "dUSDC", name: "Dummy USDC", amount: "10", faucetAddress: DUSDC_FAUCET_ADDRESS as `0x${string}` },
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

  const { 
    writeContractAsync,
    isPending: isWritePending,
    reset: resetWrite 
  } = useWriteContract()

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined)

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({ 
    hash: txHash,
    chainId: SEPOLIA_CHAIN_ID,
  })

  // Handle tx confirmed
  useEffect(() => {
    if (isConfirmed && txHash && claimingToken) {
      toast.dismiss("claim")
      toast.success(`Claimed ${claimingToken} successfully!`)
      refetchDeth()
      refetchDusdc()
      setTxHash(undefined)
      resetWrite()
      setClaimingToken(null)
    }
  }, [isConfirmed, txHash, claimingToken, refetchDeth, refetchDusdc, resetWrite])

  // Handle receipt error (revert)
  useEffect(() => {
    if (isReceiptError && txHash) {
      toast.dismiss("claim")
      toast.error("Transaction reverted on chain")
      setTxHash(undefined)
      resetWrite()
      setClaimingToken(null)
    }
  }, [isReceiptError, txHash, resetWrite])

  const getCooldown = (symbol: string): number => {
    const lastClaim = symbol === "dETH" ? dethLastClaim : dusdcLastClaim
    if (!lastClaim) return 0
    const remaining = (Number(lastClaim) + COOLDOWN_PERIOD) - now
    return remaining > 0 ? remaining : 0
  }

  const formatCooldown = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`
  }

  const handleClaim = useCallback(async (faucet: TokenFaucet) => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet")
      return
    }
    if (claimingToken) return // prevent double click

    // STEP 1: Force switch to Sepolia if not on it
    if (!isOnSepolia) {
      toast.loading("Switching to Sepolia...", { id: "claim" })
      try {
        await switchChainAsync({ chainId: SEPOLIA_CHAIN_ID })
        // Wait a tick for wagmi to update
        await new Promise(r => setTimeout(r, 500))
      } catch (e) {
        toast.dismiss("claim")
        toast.error("Please switch to Sepolia network manually")
        return
      }
    }

    // STEP 2: Start claim
    setClaimingToken(faucet.symbol)
    toast.loading(`Claiming ${faucet.symbol}...`, { id: "claim" })

    try {
      // writeContractAsync returns the tx hash directly
      const hash = await writeContractAsync({
        address: faucet.faucetAddress,
        abi: FAUCET_ABI,
        functionName: 'claim',
        chain: sepolia,
        account: address!,
      })
      
      // STEP 3: Got hash, now wait for receipt
      setTxHash(hash)
      toast.loading(`Confirming ${faucet.symbol}...`, { id: "claim" })
      
    } catch (e: any) {
      toast.dismiss("claim")
      const msg = e?.message || ""
      if (msg.includes("User rejected") || msg.includes("User denied") || msg.includes("rejected")) {
        toast.error("Transaction cancelled")
      } else if (msg.includes("Cooldown") || msg.includes("cooldown")) {
        toast.error("Cooldown not expired yet (24h)")
      } else if (msg.includes("insufficient funds")) {
        toast.error("Insufficient Sepolia ETH for gas")
      } else {
        toast.error("Claim failed - check console")
        console.error("Claim error:", e)
      }
      resetWrite()
      setClaimingToken(null)
    }
  }, [address, isConnected, isOnSepolia, claimingToken, switchChainAsync, writeContractAsync, resetWrite])

  const isLoading = isWritePending || isConfirming || !!txHash

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Faucet</h1>
            <p className="text-muted-foreground mt-1">Get testnet tokens to try Altera</p>
            {isConnected && !isOnSepolia && (
              <Alert className="mt-4 border-orange-500 bg-orange-500/10">
                <AlertDescription className="text-orange-400">
                  ⚠️ You are not on Sepolia. Click claim to auto-switch, or switch manually in MetaMask.
                </AlertDescription>
              </Alert>
            )}
            <Link href="/faucet/troubleshoot">
              <span className="text-sm text-primary hover:underline mt-2 inline-block">Having issues? → Troubleshooting guide</span>
            </Link>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  Sepolia ETH (Gas)
                </CardTitle>
                <CardDescription>
                  You need Sepolia ETH to pay for transaction fees on the testnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 border-border bg-secondary/30">
                  <AlertDescription className="text-sm">
                    Sepolia ETH is required for gas fees. Get some from official Ethereum faucets before using Altera.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" asChild>
                    <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer">
                      Google Cloud Faucet
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" asChild>
                    <a href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" rel="noopener noreferrer">
                      Alchemy Faucet
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  Test Tokens
                </CardTitle>
                <CardDescription>
                  Claim test tokens to use on Altera testnet (once per 24 hours)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {FAUCETS.map((faucet) => {
                    const cooldown = getCooldown(faucet.symbol)
                    const isClaiming = claimingToken === faucet.symbol
                    
                    return (
                      <div key={faucet.symbol} className="rounded-lg bg-secondary/30 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{faucet.symbol}</h4>
                            <p className="text-sm text-muted-foreground">{faucet.name}</p>
                          </div>
                          <Badge variant="secondary">{faucet.amount} per claim</Badge>
                        </div>
                        {!isConnected ? (
                          <Button disabled className="w-full">Connect Wallet</Button>
                        ) : cooldown > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Cooldown: {formatCooldown(cooldown)}</span>
                            </div>
                            <Button disabled className="w-full">Claim {faucet.symbol}</Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => handleClaim(faucet)}
                            disabled={isLoading}
                          >
                            {isClaiming && isLoading ? "Claiming..." : `Claim ${faucet.symbol}`}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold">i</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">About Test Tokens</p>
                    <p>dETH and dUSDC are ERC-20 tokens deployed on Sepolia for testing purposes. They have no real value and are only used to test Altera protocol features. You can claim tokens once every 24 hours.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
