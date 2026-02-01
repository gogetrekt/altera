"use client"

import { useState } from "react"
import { ArrowDownUp, Clock, Fuel, ChevronDown, Clock as ClockIcon } from "lucide-react"
import { toast } from "sonner"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const networks = [
  { id: "sepolia", name: "Sepolia", icon: "S" },
  { id: "arbitrum", name: "Arbitrum Sepolia", icon: "A" },
  { id: "optimism", name: "Optimism Sepolia", icon: "O" },
  { id: "base", name: "Base Sepolia", icon: "B" },
]

export default function BridgePage() {
  const [fromNetwork, setFromNetwork] = useState(networks[0])
  const [toNetwork, setToNetwork] = useState(networks[1])
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const balance = "1.2345"
  const estimatedTime = "~5 minutes"
  const estimatedFee = "0.001 ETH"

  const switchNetworks = () => {
    const temp = fromNetwork
    setFromNetwork(toNetwork)
    setToNetwork(temp)
  }

  const handleBridge = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) return
    setIsLoading(true)
    toast.loading("Initiating bridge...", { id: "bridge" })
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    toast.success(`Bridge initiated: ${amount} ETH from ${fromNetwork.name} to ${toNetwork.name}`, { id: "bridge" })
    setAmount("")
  }

  const isValidAmount = amount && Number.parseFloat(amount) > 0

  return (
    <PageLayout minimalFooter>
      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] py-12 px-4">
        {/* Phase 2 Warning */}
        <Alert className="max-w-md mb-6 border-primary/50 bg-primary/10">
          <ClockIcon className="h-4 w-4" />
          <AlertTitle>Phase 2 Feature</AlertTitle>
          <AlertDescription>
            Bridge is coming soon. This interface is a preview of the upcoming functionality.
          </AlertDescription>
        </Alert>

        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Bridge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* From Network */}
            <div className="space-y-2">
              <Label>From Network</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {fromNetwork.icon}
                      </div>
                      {fromNetwork.name}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[352px]">
                  {networks.map((network) => (
                    <DropdownMenuItem
                      key={network.id}
                      onClick={() => setFromNetwork(network)}
                      disabled={network.id === toNetwork.id}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary mr-2">
                        {network.icon}
                      </div>
                      {network.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Amount (ETH)</Label>
                <span className="text-xs text-muted-foreground">Balance: {balance}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setAmount(balance)}
                >
                  Max
                </Button>
              </div>
            </div>

            {/* Switch Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-border bg-background"
                onClick={switchNetworks}
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            {/* To Network */}
            <div className="space-y-2">
              <Label>To Network</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                        {toNetwork.icon}
                      </div>
                      {toNetwork.name}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[352px]">
                  {networks.map((network) => (
                    <DropdownMenuItem
                      key={network.id}
                      onClick={() => setToNetwork(network)}
                      disabled={network.id === fromNetwork.id}
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary mr-2">
                        {network.icon}
                      </div>
                      {network.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Estimated Time & Fee */}
            {isValidAmount && (
              <div className="rounded-lg bg-secondary/30 p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Estimated Time</span>
                  </div>
                  <span className="font-medium">{estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Fuel className="h-4 w-4" />
                    <span>Bridge Fee</span>
                  </div>
                  <span className="font-medium">{estimatedFee}</span>
                </div>
              </div>
            )}

            {/* Bridge Button */}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleBridge}
              disabled={!isValidAmount || isLoading}
            >
              {isLoading ? "Bridging..." : "Bridge"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
