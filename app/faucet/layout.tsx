import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Faucet | Altera",
  description: "Claim free dETH and dUSDC testnet tokens on Sepolia to try the Altera DeFi platform.",
}

export default function FaucetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
