import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Staking | Altera",
  description: "Stake dUSDC or dETH on Sepolia testnet to earn CORE token rewards.",
}

export default function StakingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
