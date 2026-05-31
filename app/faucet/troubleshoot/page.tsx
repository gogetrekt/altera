"use client"

import { ExternalLink } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { SectionHeader } from "@/components/ui/section-header"

function TroubleshootCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1">
      <div className="px-5 py-4 border-b border-border">
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="px-5 py-4 space-y-4 text-sm text-muted-foreground">
        {children}
      </div>
    </div>
  )
}

export default function FaucetTroubleshootPage() {
  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-5">

          <div className="mb-8 animate-fade-up">
            <SectionHeader title="Faucet Troubleshooting" as="h1" />
            <p className="text-sm text-muted-foreground mt-1">Having issues claiming tokens?</p>
          </div>

          <div className="space-y-4 animate-fade-up stagger-1">

            <TroubleshootCard title="MetaMask Shows &quot;Review alert&quot; But Can&apos;t Confirm">
              <p>MetaMask&apos;s simulation feature sometimes fails with testnet RPCs. Here&apos;s how to fix it:</p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Open MetaMask</li>
                <li>Go to <strong className="text-foreground">Settings</strong> → <strong className="text-foreground">Experimental</strong></li>
                <li>Find <strong className="text-foreground">Smart Transaction Controller</strong> or <strong className="text-foreground">Transaction simulations</strong></li>
                <li>Toggle it <strong className="text-foreground">OFF</strong></li>
                <li>Refresh the page and try claiming again</li>
              </ol>
            </TroubleshootCard>

            <TroubleshootCard title="Change MetaMask RPC Endpoint">
              <p>If you&apos;re still having issues, try switching to a more stable RPC:</p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>In MetaMask, click the network dropdown (top of extension)</li>
                <li>Select <strong className="text-foreground">Sepolia</strong></li>
                <li>Click <strong className="text-foreground">Add Custom RPC</strong> or edit the existing Sepolia network</li>
                <li>Set the RPC URL to one of these:
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 font-mono text-xs">
                    <li>https://eth-sepolia.g.alchemy.com/v2/demo</li>
                    <li>https://1rpc.io/sepolia</li>
                    <li>https://sepolia.infura.io/v3/3c7ff243cb5d4c7c998042a9d7bda05f</li>
                  </ul>
                </li>
                <li>Save and try claiming again</li>
              </ol>
            </TroubleshootCard>

            <TroubleshootCard title="Check Your Claim Cooldown">
              <p>You can only claim once every 24 hours per token. The faucet shows the remaining cooldown time below each token.</p>
              <div className="rounded-md border border-border bg-surface-2 px-4 py-3 text-sm text-muted-foreground">
                If the cooldown doesn&apos;t update, try refreshing the page (press F5 or Ctrl+Shift+R).
              </div>
            </TroubleshootCard>

            <TroubleshootCard title="Need Sepolia ETH for Gas?">
              <p>You need a small amount of Sepolia ETH to pay for transaction fees. Get some from these faucets:</p>
              <div className="space-y-2">
                <a
                  href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-150"
                >
                  Google Cloud Faucet <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.alchemy.com/faucets/ethereum-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-150"
                >
                  Alchemy Faucet <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              </div>
            </TroubleshootCard>

            <TroubleshootCard title="Still Having Issues?">
              <p>If none of the above solutions work, try:</p>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Clear your browser cache and cookies (Ctrl+Shift+Delete)</li>
                <li>Use a different browser</li>
                <li>Make sure you&apos;re on the Sepolia testnet</li>
                <li>Check that your wallet has at least 0.001 Sepolia ETH</li>
              </ul>
            </TroubleshootCard>

          </div>
        </div>
      </div>
    </PageLayout>
  )
}
