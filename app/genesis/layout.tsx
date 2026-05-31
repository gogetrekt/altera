import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Genesis Pass | Altera",
  description: "Mint the Altera Genesis Pass NFT on Base Mainnet. Limited to 500 passes. Requires real ETH.",
}

export default function GenesisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
