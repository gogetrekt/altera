import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bridge',
  description:
    'Cross-chain bridge is a Phase 2 feature. Not available in the current release. No bridging is possible at this time.',
}

export default function BridgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
