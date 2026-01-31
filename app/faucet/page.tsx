"use client"

import { useState, useEffect } from "react"
import { Droplets, ExternalLink, Clock, Coins } from "lucide-react"
import { toast } from "sonner"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface TokenFaucet {
  symbol: string
  name: string
  amount: string
  cooldown: number // seconds remaining
}

export default function FaucetPage() {
  const [tokens, setTokens] = useState<TokenFaucet[]>([
    { symbol: "dETH", name: "Dummy ETH", amount: "0.5", cooldown: 0 },
    { symbol: "dUSDC", name: "Dummy USDC", amount: "1,000", cooldown: 0 },
  ])
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((prev) =>
        prev.map((token) => ({
          ...token,
          cooldown: Math.max(0, token.cooldown - 1),
        }))
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleClaim = async (symbol: string) => {
    setIsLoading(symbol)
    toast.loading(`Claiming ${symbol}...`, { id: `claim-${symbol}` })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setTokens((prev) =>
      prev.map((token) =>
        token.symbol === symbol
          ? { ...token, cooldown: 300 } // 5 minute cooldown
          : token
      )
    )
    setIsLoading(null)
    const token = tokens.find((t) => t.symbol === symbol)
    toast.success(`Claimed ${token?.amount} ${symbol}`, { id: `claim-${symbol}` })
  }

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
                      href="https://sepoliafaucet.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Sepolia Faucet
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
                  Claim test tokens to use on Altera testnet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tokens.map((token) => (
                    <div
                      key={token.symbol}
                      className="rounded-lg bg-secondary/30 p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{token.symbol}</h4>
                          <p className="text-sm text-muted-foreground">{token.name}</p>
                        </div>
                        <Badge variant="secondary">{token.amount} per claim</Badge>
                      </div>
                      {token.cooldown > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Cooldown: {formatCooldown(token.cooldown)}</span>
                          </div>
                          <Button disabled className="w-full">
                            Claim {token.symbol}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          onClick={() => handleClaim(token.symbol)}
                          disabled={isLoading === token.symbol}
                        >
                          {isLoading === token.symbol ? "Claiming..." : `Claim ${token.symbol}`}
                        </Button>
                      )}
                    </div>
                  ))}
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
                    <p>dETH and dUSDC are ERC-20 tokens deployed on Sepolia for testing purposes. They have no real value and are only used to test Altera protocol features. You can claim tokens every 5 minutes.</p>
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
