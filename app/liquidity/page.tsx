"use client"

import { useState } from "react"
import { Plus, Minus, Info } from "lucide-react"
import { toast } from "sonner"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Position {
  id: string
  pair: string
  feeTier: string
  range: string
  liquidity: string
}

const mockPositions: Position[] = [
  { id: "1", pair: "ETH/USDC", feeTier: "0.3%", range: "Full Range", liquidity: "$4,521.32" },
  { id: "2", pair: "ETH/CORE", feeTier: "1.0%", range: "Full Range", liquidity: "$2,150.00" },
]

export default function LiquidityPage() {
  const [ethAmount, setEthAmount] = useState("")
  const [usdcAmount, setUsdcAmount] = useState("")
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [isLoading, setIsLoading] = useState(false)

  const currentPrice = 2500
  const ethBalance = "1.2345"
  const usdcBalance = "5,432.10"

  const handleEthChange = (value: string) => {
    setEthAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value))) {
      setUsdcAmount((Number.parseFloat(value) * currentPrice).toFixed(2))
    } else {
      setUsdcAmount("")
    }
  }

  const handleUsdcChange = (value: string) => {
    setUsdcAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value))) {
      setEthAmount((Number.parseFloat(value) / currentPrice).toFixed(6))
    } else {
      setEthAmount("")
    }
  }

  const handleAddLiquidity = async () => {
    if (!ethAmount || Number.parseFloat(ethAmount) <= 0) return
    setIsLoading(true)
    toast.loading("Adding liquidity...", { id: "add-liquidity" })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const newPosition: Position = {
      id: String(Date.now()),
      pair: "ETH/USDC",
      feeTier: "0.3%",
      range: "Full Range",
      liquidity: `$${(Number.parseFloat(ethAmount) * currentPrice * 2).toFixed(2)}`,
    }
    setPositions([newPosition, ...positions])
    setIsLoading(false)
    toast.success("Liquidity added successfully", { id: "add-liquidity" })
    setEthAmount("")
    setUsdcAmount("")
  }

  const handleRemoveLiquidity = async (positionId: string) => {
    setIsLoading(true)
    toast.loading("Removing liquidity...", { id: "remove-liquidity" })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setPositions(positions.filter((p) => p.id !== positionId))
    setIsLoading(false)
    toast.success("Liquidity removed successfully", { id: "remove-liquidity" })
  }

  const isValidAmount = ethAmount && Number.parseFloat(ethAmount) > 0

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Liquidity</h1>
            <p className="text-muted-foreground mt-1">Provide liquidity to earn fees</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Liquidity Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add Liquidity
                </CardTitle>
                <CardDescription>
                  ETH / USDC Pool
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Price */}
                <div className="rounded-lg bg-secondary/30 p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Current Price: <span className="text-foreground font-medium">1 ETH = {currentPrice.toLocaleString()} USDC</span></span>
                  </div>
                </div>

                {/* ETH Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>ETH Amount</Label>
                    <span className="text-xs text-muted-foreground">Balance: {ethBalance}</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={ethAmount}
                      onChange={(e) => handleEthChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEthChange(ethBalance)}
                    >
                      Max
                    </Button>
                  </div>
                </div>

                {/* USDC Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>USDC Amount (auto-calculated)</Label>
                    <span className="text-xs text-muted-foreground">Balance: {usdcBalance}</span>
                  </div>
                  <Input
                    type="text"
                    placeholder="0.0"
                    value={usdcAmount}
                    onChange={(e) => handleUsdcChange(e.target.value)}
                  />
                </div>

                {/* Position Preview */}
                {isValidAmount && (
                  <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                    <h4 className="text-sm font-medium">Position Preview</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pair</span>
                        <p className="font-medium">ETH/USDC</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fee Tier</span>
                        <p className="font-medium">0.3%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Range</span>
                        <p className="font-medium">Full Range</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Value</span>
                        <p className="font-medium">${(Number.parseFloat(ethAmount) * currentPrice * 2).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleAddLiquidity}
                  disabled={!isValidAmount || isLoading}
                >
                  {isLoading ? "Adding..." : "Add Liquidity"}
                </Button>
              </CardContent>
            </Card>

            {/* Your Positions Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Your Positions</CardTitle>
                <CardDescription>
                  {positions.length} active position{positions.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active positions</p>
                    <p className="text-sm mt-1">Add liquidity to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      <TooltipProvider>
                        {positions.map((position) => (
                          <div
                            key={position.id}
                            className="rounded-lg bg-secondary/30 p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{position.pair}</span>
                              <Badge variant="secondary">{position.feeTier}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Range</span>
                                <p className="font-medium">{position.range}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Liquidity</span>
                                <p className="font-medium">{position.liquidity}</p>
                              </div>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full bg-transparent"
                                  onClick={() => handleRemoveLiquidity(position.id)}
                                  disabled={isLoading}
                                >
                                  <Minus className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Remove this liquidity position</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </TooltipProvider>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
