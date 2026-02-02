"use client"

import { useState, useEffect } from "react"
import { Droplets, ExternalLink, Clock, Coins } from "lucide-react"
import { toast } from "sonner"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { sepolia } from "viem/chains"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  DETH_FAUCET_ADDRESS,
  DUSDC_FAUCET_ADDRESS,
  FAUCET_ABI,
} from "@/lib/uniswap-config"

const COOLDOWN_PERIOD = 24 * 60 * 60 // 24 hours in seconds

interface TokenFaucet {
  symbol: string
  name: string
  amount: string
  faucetAddress: string
}

const FAUCETS: TokenFaucet[] = [
  { symbol: "dETH", name: "Dummy ETH", amount: "0.5", faucetAddress: DETH_FAUCET_ADDRESS },
  { symbol: "dUSDC", name: "Dummy USDC", amount: "100", faucetAddress: DUSDC_FAUCET_ADDRESS },
]

export default function FaucetPage() {
  const { address, isConnected } = useAccount()
  const [claimingToken, setClaimingToken] = useState<string | null>(null)
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))
  const [prevAddress, setPrevAddress] = useState<string | undefined>(undefined)
  const [isAddressChanging, setIsAddressChanging] = useState(false)

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // dETH last claim
  const { data: dethLastClaim, refetch: refetchDethLastClaim } = useReadContract({
    address: DETH_FAUCET_ADDRESS as `0x${string}`,
    abi: FAUCET_ABI,
    functionName: 'lastClaim',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!address,
    },
  })

  // dUSDC last claim
  const { data: dusdcLastClaim, refetch: refetchDusdcLastClaim } = useReadContract({
    address: DUSDC_FAUCET_ADDRESS as `0x${string}`,
    abi: FAUCET_ABI,
    functionName: 'lastClaim',
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: !!address,
    },
  })

  const { writeContract, data: txHash, isPending, reset, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess, error: txError } = useWaitForTransactionReceipt({ hash: txHash })

  // Refetch when address changes
  useEffect(() => {
    if (address && address !== prevAddress) {
      setIsAddressChanging(true)
      setPrevAddress(address)
      // Small delay to ensure wagmi updates the query args
      setTimeout(() => {
        refetchDethLastClaim()
        refetchDusdcLastClaim()
        setIsAddressChanging(false)
      }, 100)
    }
  }, [address, prevAddress, refetchDethLastClaim, refetchDusdcLastClaim])

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.dismiss("claim")
      toast.success(`Claimed ${claimingToken} successfully!`)
      refetchDethLastClaim()
      refetchDusdcLastClaim()
      reset()
      setClaimingToken(null)
    }
  }, [isSuccess, claimingToken, reset, refetchDethLastClaim, refetchDusdcLastClaim])
  // Handle errors
  useEffect(() => {
    if (writeError || txError) {
      toast.dismiss("claim")
      const errorMessage = writeError?.message || txError?.message || "Transaction failed"
      // Check for user rejection
      if (errorMessage.toLowerCase().includes("user rejected") || errorMessage.toLowerCase().includes("user denied")) {
        toast.error("Transaction cancelled by user")
      } else if (errorMessage.toLowerCase().includes("cooldown")) {
        toast.error("Cooldown period not over yet")
      } else {
        toast.error(`Failed to claim: ${errorMessage.slice(0, 100)}`)
      }
      reset()
      setClaimingToken(null)
    }
  }, [writeError, txError, reset])

  const getCooldownRemaining = (symbol: string): number => {
    // Don't show cooldown while address is changing
    if (isAddressChanging) return 0
    
    const lastClaim = symbol === "dETH" ? dethLastClaim : dusdcLastClaim
    if (lastClaim === undefined || lastClaim === null) return 0
    const lastClaimTime = Number(lastClaim)
    if (lastClaimTime === 0) return 0
    const nextClaimTime = lastClaimTime + COOLDOWN_PERIOD
    const remaining = nextClaimTime - now
    return remaining > 0 ? remaining : 0
  }

  const formatCooldown = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`
    }
    return `${mins}m ${secs}s`
  }

  const handleClaim = (faucet: TokenFaucet) => {
    if (!address) return
    
    setClaimingToken(faucet.symbol)
    writeContract(
      {
        address: faucet.faucetAddress as `0x${string}`,
        abi: FAUCET_ABI,
        functionName: 'claim',
        chain: sepolia,
        account: address,
      },
      {
        onError: (error) => {
          toast.dismiss("claim")
          const errorMessage = error?.message || "Transaction failed"
          if (errorMessage.toLowerCase().includes("user rejected") || errorMessage.toLowerCase().includes("user denied")) {
            toast.error("Transaction cancelled")
          } else if (errorMessage.toLowerCase().includes("cooldown") || errorMessage.toLowerCase().includes("wait")) {
            toast.error("Please wait for cooldown period")
          } else if (errorMessage.toLowerCase().includes("insufficient")) {
            toast.error("Faucet is empty or insufficient balance")
          } else {
            toast.error("Claim failed. Check console for details.")
            console.error("Claim error:", error)
          }
          setClaimingToken(null)
        },
      }
    )
    toast.loading(`Claiming ${faucet.symbol}...`, { id: "claim" })
  }

  const isLoading = isPending || isConfirming

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Faucet</h1>
            <p className="text-muted-foreground mt-1">Get testnet tokens to try Altera</p>
          </div>

          <div className="space-y-6">
            {/* Sepolia ETH Section */}
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
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    asChild
                  >
                    <a
                      href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Cloud Faucet
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    asChild
                  >
                    <a
                      href="https://www.alchemy.com/faucets/ethereum-sepolia"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Alchemy Faucet
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Tokens Section */}
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
                    const cooldown = getCooldownRemaining(faucet.symbol)
                    const isClaiming = claimingToken === faucet.symbol && isLoading
                    
                    return (
                      <div
                        key={faucet.symbol}
                        className="rounded-lg bg-secondary/30 p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{faucet.symbol}</h4>
                            <p className="text-sm text-muted-foreground">{faucet.name}</p>
                          </div>
                          <Badge variant="secondary">{faucet.amount} per claim</Badge>
                        </div>
                        {!isConnected ? (
                          <Button disabled className="w-full">
                            Connect Wallet
                          </Button>
                        ) : cooldown > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>Cooldown: {formatCooldown(cooldown)}</span>
                            </div>
                            <Button disabled className="w-full">
                              Claim {faucet.symbol}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => handleClaim(faucet)}
                            disabled={isClaiming || isLoading}
                          >
                            {isClaiming ? "Claiming..." : `Claim ${faucet.symbol}`}
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
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
