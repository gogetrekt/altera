import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Swap | Altera",
  description: "Swap dETH and dUSDC on Sepolia testnet using the Altera fixed-rate swap contract.",
}

export default function SwapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
