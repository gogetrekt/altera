import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Genesis Pass',
  description:
    'Mint the Altera Genesis Pass on Base Mainnet. Limited to 500 soulbound NFTs. Requires real ETH. Contracts are unaudited.',
}

export default function GenesisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
