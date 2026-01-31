"use client"

import { useState } from "react"
import Image from "next/image"
import { Loader2, Sparkles, Shield, Lock, Check } from "lucide-react"
import { toast } from "sonner"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type MintState = "idle" | "minting" | "minted"

export default function GenesisPassPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [mintState, setMintState] = useState<MintState>("idle")
  const [quantity, setQuantity] = useState(1)

  const price = 0.05
  const remaining = 847
  const total = 1000

  const simulateMint = async () => {
    if (!isConnected) {
      setIsConnected(true)
      return
    }

    setMintState("minting")
    toast("Transaction submitted", {
      description: "Waiting for confirmation...",
    })

    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Simulate random outcome: 70% success, 15% fail, 15% reject
    const outcome = Math.random()

    if (outcome < 0.7) {
      // Success
      setMintState("minted")
      toast.success("Genesis Pass minted successfully", {
        description: "Welcome to Altera early access",
      })
      // Store in localStorage to persist genesis holder status
      localStorage.setItem("altera_genesis_holder", "true")
    } else if (outcome < 0.85) {
      // Failed (on-chain revert)
      setMintState("idle")
      toast.error("Transaction failed", {
        description: "Insufficient funds or mint limit reached",
      })
    } else {
      // User rejected
      setMintState("idle")
      toast("Transaction cancelled", {
        description: "You rejected the transaction",
      })
    }
  }

  const getMintButtonContent = () => {
    if (!isConnected) {
      return "Connect Wallet"
    }
    if (mintState === "minting") {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Minting...
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

  return (
    <PageLayout minimalFooter>
      <div className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left: NFT Preview + Description */}
            <div className="space-y-6">
              {/* NFT Preview */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-card to-primary/10 border border-border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-3/4 h-3/4 flex items-center justify-center">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    {/* NFT Visual */}
                    <div className="relative z-10 w-full h-full rounded-xl bg-gradient-to-br from-primary/30 via-background to-primary/20 border border-primary/30 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center">
                          <Sparkles className="h-12 w-12 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">Genesis Pass</p>
                          <p className="text-sm text-muted-foreground">#0001 - #1000</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                  <CardDescription>Limited to 1,000 passes total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price & Remaining */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-semibold text-foreground">{price} ETH</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold text-foreground">{remaining} / {total}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/50">
                      <span className="text-muted-foreground">Network</span>
                      <Badge variant="outline" className="text-xs">Sepolia Testnet</Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Minted</span>
                      <span className="text-foreground">{((total - remaining) / total * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${((total - remaining) / total * 100)}%` }}
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
                    <span className="text-xl font-bold text-primary">{price} ETH</span>
                  </div>

                  {/* Mint Button */}
                  <Button
                    onClick={simulateMint}
                    disabled={mintState === "minting" || mintState === "minted"}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
                  >
                    {getMintButtonContent()}
                  </Button>

                  {/* Info Text */}
                  {mintState === "minted" && (
                    <p className="text-center text-sm text-green-500">
                      You are now a Genesis Holder. Check your Dashboard for your badge.
                    </p>
                  )}
                  {mintState === "idle" && isConnected && (
                    <p className="text-center text-xs text-muted-foreground">
                      By minting, you agree to hold a non-transferable Genesis Pass
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
