"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Loader2, Sparkles, Shield, Lock, Check, AlertCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi"
import { parseEther } from "viem"
import { base } from "wagmi/chains"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { GENESIS_NFT_ADDRESS, GENESIS_NFT_ABI, GENESIS_NFT_CONFIG } from "@/lib/genesis-config"

type MintState = "idle" | "minting" | "confirming" | "minted"

export default function GenesisPassPage() {
  const { address, isConnected, chain } = useAccount()
  const [mintState, setMintState] = useState<MintState>("idle")

  // Check if on correct network (Base Mainnet) - use chain from useAccount for accurate detection
  const isCorrectNetwork = chain?.id === base.id

  // Get user's ETH balance on Base
  const { data: ethBalance } = useBalance({
    address,
    chainId: base.id,
  })

  // Get total supply (live updates)
  const { data: totalSupply, isLoading: isLoadingSupply, refetch: refetchSupply } = useReadContract({
    address: GENESIS_NFT_ADDRESS,
    abi: GENESIS_NFT_ABI,
    functionName: 'totalSupply',
    chainId: base.id,
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  // Get user's balance (check if already minted)
  const { data: userBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useReadContract({
    address: GENESIS_NFT_ADDRESS,
    abi: GENESIS_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  })

  // Calculate stats
  const maxSupply = GENESIS_NFT_CONFIG.maxSupply
  const minted = totalSupply ? Number(totalSupply) : 0
  const remaining = maxSupply - minted
  const mintedPercentage = (minted / maxSupply) * 100
  const isSoldOut = remaining <= 0
  const alreadyMinted = userBalance !== undefined && userBalance > 0n
  const hasEnoughETH = ethBalance && ethBalance.value >= parseEther(GENESIS_NFT_CONFIG.totalPrice)
  const canMint = isConnected && isCorrectNetwork && !alreadyMinted && !isSoldOut && hasEnoughETH && mintState === "idle"

  // Mint transaction
  const { writeContract, data: mintTxHash, isPending: isMintPending, reset: resetMint, error: mintError } = useWriteContract()

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
    hash: mintTxHash,
  })

  // Update mint state based on transaction status
  useEffect(() => {
    if (isMintPending) {
      setMintState("minting")
    } else if (isConfirming) {
      setMintState("confirming")
    } else if (isConfirmed && receipt?.status === "success") {
      setMintState("minted")
      toast.success("Genesis Pass minted successfully!", {
        description: "Welcome to Altera early access",
      })
      // Refetch balances after successful mint
      refetchSupply()
      refetchBalance()
    } else if (mintError) {
      setMintState("idle")
      handleMintError(mintError)
    }
  }, [isMintPending, isConfirming, isConfirmed, receipt, mintError, refetchSupply, refetchBalance])

  // Handle mint errors
  const handleMintError = (error: Error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes("user rejected") || message.includes("user denied")) {
      toast.error("Transaction cancelled", {
        description: "You rejected the transaction",
      })
    } else if (message.includes("insufficient funds")) {
      toast.error("Insufficient funds", {
        description: "You don't have enough ETH to mint",
      })
    } else if (message.includes("already minted") || message.includes("max per wallet")) {
      toast.error("Already minted", {
        description: "You already own a Genesis Pass",
      })
    } else if (message.includes("sold out") || message.includes("max supply")) {
      toast.error("Sold out", {
        description: "All Genesis Passes have been minted",
      })
    } else {
      toast.error("Minting failed", {
        description: "Please try again",
      })
    }
    console.error("Mint error:", error)
  }

  // Handle mint
  const handleMint = async () => {
    if (!canMint || !address) return

    try {
      writeContract({
        address: GENESIS_NFT_ADDRESS as `0x${string}`,
        abi: GENESIS_NFT_ABI,
        functionName: 'mint',
        args: [1n], // Mint 1 NFT
        value: parseEther(GENESIS_NFT_CONFIG.totalPrice), // 0.00101 ETH (price + protocol fee)
        chain: base,
        account: address,
      })

      toast.loading("Transaction submitted", {
        description: "Waiting for confirmation...",
        id: "mint-tx",
      })
    } catch (error) {
      console.error("Mint error:", error)
      setMintState("idle")
    }
  }

  // Dismiss loading toast when transaction completes
  useEffect(() => {
    if (isConfirmed || mintError) {
      toast.dismiss("mint-tx")
    }
  }, [isConfirmed, mintError])

  // Get button content
  const getMintButtonContent = () => {
    if (!isConnected) {
      return "Connect Wallet"
    }
    if (!isCorrectNetwork) {
      return "Switch Network in Wallet"
    }
    if (alreadyMinted) {
      return (
        <>
          <Check className="h-4 w-4 mr-2" />
          Already Minted
        </>
      )
    }
    if (isSoldOut) {
      return "Sold Out"
    }
    if (!hasEnoughETH) {
      return "Insufficient ETH"
    }
    if (mintState === "minting") {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Minting...
        </>
      )
    }
    if (mintState === "confirming") {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Confirming...
        </>
      )
    }
    if (mintState === "minted") {
      return (
        <>
          <Check className="h-4 w-4 mr-2" />
          Minted
        </>
      )
    }
    return "Mint Genesis Pass"
  }

  // Handle button click
  const handleButtonClick = () => {
    if (!isConnected) {
      // Trigger wallet connect (handled by navbar)
      window.ethereum?.request({ method: 'eth_requestAccounts' })
      return
    }
    if (canMint) {
      handleMint()
    }
  }

  const isButtonDisabled = 
    (isConnected && !canMint) || 
    mintState === "minting" || 
    mintState === "confirming" || 
    mintState === "minted"

  return (
    <PageLayout minimalFooter>
      <div className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: NFT Preview + Description */}
            <div className="space-y-6">
              {/* NFT Preview */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/genesis-pass.svg"
                  alt="Altera Genesis Pass NFT"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground">Altera Genesis Pass</h1>
                <p className="text-muted-foreground leading-relaxed">
                  The Genesis Pass is a soulbound NFT that grants early access to the Altera protocol. 
                  As a Genesis holder, you'll receive exclusive benefits including priority access to new features, 
                  governance participation, and potential future rewards.
                </p>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Early Access</p>
                      <p className="text-xs text-muted-foreground">Priority to new features</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <Lock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Soulbound</p>
                      <p className="text-xs text-muted-foreground">Non-transferable NFT</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mint Card */}
            <div className="lg:sticky lg:top-24">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Mint Genesis Pass</CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Soulbound
                    </Badge>
                  </div>
                  <CardDescription>Limited to {maxSupply.toLocaleString()} passes total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Network Warning */}
                  {isConnected && !isCorrectNetwork && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <p className="text-sm">Please switch to Base Mainnet to mint</p>
                    </div>
                  )}

                  {/* Price & Remaining */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold text-foreground">{GENESIS_NFT_CONFIG.price} ETH</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Remaining</span>
                      {isLoadingSupply ? (
                        <Skeleton className="h-5 w-20" />
                      ) : (
                        <span className="font-semibold text-foreground">{remaining.toLocaleString()} / {maxSupply.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Network</span>
                      <Badge variant="outline" className="text-xs">Base Mainnet</Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Minted</span>
                      {isLoadingSupply ? (
                        <Skeleton className="h-4 w-12" />
                      ) : (
                        <span className="text-foreground">{mintedPercentage.toFixed(1)}%</span>
                      )}
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${mintedPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Quantity (disabled for soulbound, limit 1) */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <span className="font-medium">1 (max per wallet)</span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-primary">{GENESIS_NFT_CONFIG.price} ETH</span>
                  </div>

                  {/* Mint Button */}
                  <Button
                    onClick={handleButtonClick}
                    disabled={isButtonDisabled}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {getMintButtonContent()}
                  </Button>

                  {/* Status Messages */}
                  {mintState === "minted" && (
                    <div className="space-y-2">
                      <p className="text-center text-sm text-green-500">
                        You are now a Genesis Holder. Check your Dashboard for your badge.
                      </p>
                      {mintTxHash && (
                        <a
                          href={`https://basescan.org/tx/${mintTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 text-sm text-primary hover:underline"
                        >
                          View on BaseScan
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {alreadyMinted && mintState !== "minted" && (
                    <p className="text-center text-sm text-muted-foreground">
                      You already own a Genesis Pass
                    </p>
                  )}

                  {isConnected && isCorrectNetwork && !alreadyMinted && !hasEnoughETH && (
                    <p className="text-center text-sm text-yellow-500">
                      You need at least {GENESIS_NFT_CONFIG.totalPrice} ETH on Base to mint
                    </p>
                  )}

                  {mintState === "idle" && isConnected && isCorrectNetwork && canMint && (
                    <p className="text-center text-xs text-muted-foreground">
                      By minting, you agree to hold a non-transferable Genesis Pass
                    </p>
                  )}

                  {/* Debug: remove any stray renders */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
