"use client"

import { ExternalLink } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function FaucetTroubleshootPage() {
  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Faucet Troubleshooting</h1>
            <p className="text-muted-foreground mt-1">Having issues claiming tokens?</p>
          </div>

          {/* MetaMask Simulation Issue */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>MetaMask Shows "Review alert" But Can't Confirm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                MetaMask's simulation feature sometimes fails with testnet RPCs. Here's how to fix it:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>Open MetaMask</li>
                <li>Go to <strong>Settings</strong> → <strong>Experimental</strong></li>
                <li>Find <strong>Smart Transaction Controller</strong> or <strong>Transaction simulations</strong></li>
                <li>Toggle it <strong>OFF</strong></li>
                <li>Refresh the page and try claiming again</li>
              </ol>
            </CardContent>
          </Card>

          {/* RPC Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Change MetaMask RPC Endpoint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you're still having issues, try switching to a more stable RPC:
              </p>
              <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                <li>In MetaMask, click the network dropdown (top of extension)</li>
                <li>Select <strong>Sepolia</strong></li>
                <li>Click <strong>Add Custom RPC</strong> or edit the existing Sepolia network</li>
                <li>Set the RPC URL to one of these:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 font-mono text-xs">
                    <li>https://eth-sepolia.g.alchemy.com/v2/demo</li>
                    <li>https://1rpc.io/sepolia</li>
                    <li>https://sepolia.infura.io/v3/3c7ff243cb5d4c7c998042a9d7bda05f</li>
                  </ul>
                </li>
                <li>Save and try claiming again</li>
              </ol>
            </CardContent>
          </Card>

          {/* Cooldown Check */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Check Your Claim Cooldown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You can only claim once every 24 hours per token. The faucet shows the remaining cooldown time below each token.
              </p>
              <Alert className="bg-secondary/30 border-border">
                <AlertDescription className="text-sm">
                  If the cooldown doesn't update, try refreshing the page (press F5 or Ctrl+Shift+R).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Insufficient Balance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Need Sepolia ETH for Gas?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You need a small amount of Sepolia ETH to pay for transaction fees. Get some from these faucets:
              </p>
              <div className="space-y-2">
                <a
                  href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Google Cloud Faucet <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://www.alchemy.com/faucets/ethereum-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  Alchemy Faucet <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Still Not Working */}
          <Card className="bg-card border-red-500/20">
            <CardHeader>
              <CardTitle>Still Having Issues?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If none of the above solutions work, try:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-muted-foreground mt-3">
                <li>Clear your browser cache and cookies (Ctrl+Shift+Delete)</li>
                <li>Use a different browser</li>
                <li>Make sure you're on the Sepolia testnet</li>
                <li>Check that your wallet has at least 0.001 Sepolia ETH</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
