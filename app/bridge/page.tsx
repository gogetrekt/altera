"use client"

import { ArrowDownUp, Clock, ChevronDown, Clock as ClockIcon } from "lucide-react"
import { useState } from "react"
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

  const switchNetworks = () => {
    const temp = fromNetwork
    setFromNetwork(toNetwork)
    setToNetwork(temp)
  }

  return (
    <PageLayout minimalFooter>
      <div className="flex flex-col items-center min-h-[calc(100vh-4rem)] py-12 px-4">
        {/* Phase 2 Warning */}
        <Alert className="max-w-md mb-6 border-primary/50 bg-primary/10">
          <ClockIcon className="h-4 w-4" />
          <AlertTitle>Phase 2 Feature</AlertTitle>
          <AlertDescription>
            Bridge is coming soon. This interface is a preview of the upcoming functionality. No bridging is available at this time.
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
                  <Button variant="outline" className="w-full justify-between bg-transparent" disabled>
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
                <span className="text-xs text-muted-foreground">Balance: unavailable</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1"
                  disabled
                />
                <Button variant="secondary" size="sm" disabled>
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
                disabled
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            {/* To Network */}
            <div className="space-y-2">
              <Label>To Network</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-transparent" disabled>
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

            {/* Estimated details placeholder */}
            <div className="rounded-lg bg-secondary/30 p-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated Time</span>
                </div>
                <span className="font-medium text-muted-foreground">Available in Phase 2</span>
              </div>
            </div>

            {/* Coming Soon Button */}
            <Button className="w-full" disabled>
              Bridge (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
