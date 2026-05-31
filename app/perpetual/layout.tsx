import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perpetual Trading',
  description:
    'Simulated perpetual trading interface. Phase 2 feature. No real funds involved. All data is for demonstration only.',
}

export default function PerpetualLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
