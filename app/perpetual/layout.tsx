import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Perpetual Trading | Altera",
  description: "Simulated perpetual trading interface coming in Phase 2. No real funds involved. Preview only.",
}

export default function PerpetualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
