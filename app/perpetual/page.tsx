"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, BarChart3, AlertTriangle, Clock } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PerpetualPage() {
  const [orderType, setOrderType] = useState<"long" | "short">("long")
  const [size, setSize] = useState("")
  const [leverage, setLeverage] = useState([5])

  const currentPrice = 2534.82
  const priceChange = "+2.45%"
  const high24h = 2589.00
  const low24h = 2478.50

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Phase 2 Banner */}
          <Alert className="mb-6 border-primary/50 bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <span className="font-semibold">Phase 2 Feature</span> - Perpetual trading is coming soon. This interface is a preview of the upcoming functionality.
            </AlertDescription>
          </Alert>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Perpetual Trading</h1>
            <p className="text-muted-foreground mt-1">Trade perpetual contracts with leverage</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Market Info + Chart */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Header */}
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-base px-3 py-1">ETH-PERP</Badge>
                      <span className="text-2xl font-bold">${currentPrice.toLocaleString()}</span>
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                        {priceChange}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">24h High</span>
                        <p className="font-medium text-green-500">${high24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">24h Low</span>
                        <p className="font-medium text-red-500">${low24h.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart Placeholder */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Price Chart
                  </CardTitle>
                  <CardDescription>TradingView integration coming in Phase 2</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] rounded-lg bg-secondary/30 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Chart will be available in Phase 2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Positions & Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Positions Card */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Positions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No open positions</p>
                      <p className="text-sm mt-1">Trading available in Phase 2</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Orders Card */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle>Open Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No open orders</p>
                      <p className="text-sm mt-1">Trading available in Phase 2</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Place Order */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Place Order</CardTitle>
                  <CardDescription>Open a new position</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Long / Short Toggle */}
                  <ToggleGroup
                    type="single"
                    value={orderType}
                    onValueChange={(v) => v && setOrderType(v as "long" | "short")}
                    className="w-full"
                  >
                    <ToggleGroupItem
                      value="long"
                      className="flex-1 data-[state=on]:bg-green-500/20 data-[state=on]:text-green-500"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Long
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="short"
                      className="flex-1 data-[state=on]:bg-red-500/20 data-[state=on]:text-red-500"
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Short
                    </ToggleGroupItem>
                  </ToggleGroup>

                  {/* Size Input */}
                  <div className="space-y-2">
                    <Label>Size (USDC)</Label>
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      disabled
                    />
                  </div>

                  {/* Leverage Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Leverage</Label>
                      <span className="text-sm font-medium">{leverage[0]}x</span>
                    </div>
                    <Slider
                      value={leverage}
                      onValueChange={setLeverage}
                      min={1}
                      max={20}
                      step={1}
                      disabled
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1x</span>
                      <span>20x</span>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-lg bg-secondary/30 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Price</span>
                      <span>${currentPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Liquidation Price</span>
                      <span>-</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee</span>
                      <span>0.1%</span>
                    </div>
                  </div>

                  {/* Phase 2 Notice */}
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Perpetual trading will be enabled in Phase 2. This interface is ready for future integration.
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    className={`w-full ${orderType === "long" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}
                    disabled
                  >
                    {orderType === "long" ? "Open Long" : "Open Short"} (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
