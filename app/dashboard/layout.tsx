import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Altera",
  description: "View your Altera portfolio: token balances, staking positions, and liquidity on Sepolia testnet.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
