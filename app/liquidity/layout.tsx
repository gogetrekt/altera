import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Liquidity | Altera",
  description: "Provide liquidity to the dETH/dUSDC Uniswap V3 pool on Sepolia testnet and earn trading fees.",
}

export default function LiquidityLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
