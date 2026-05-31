import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Bridge | Altera",
  description: "Cross-chain bridge coming in Phase 2. Preview of the upcoming Altera bridge interface.",
}

export default function BridgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
