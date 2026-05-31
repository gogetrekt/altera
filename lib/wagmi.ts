import { http, createConfig, fallback } from 'wagmi'
import { sepolia, base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Multiple RPC endpoints with fallback support
// Wagmi will automatically try the next RPC if the first one fails
const sepoliaRpcs = [
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
  'https://1rpc.io/sepolia',
  'https://rpc.sepolia.org',
].filter(Boolean) as string[]

// Base Mainnet RPC endpoints
const baseRpcs = [
  process.env.NEXT_PUBLIC_BASE_RPC_URL,
  'https://mainnet.base.org',
].filter(Boolean) as string[]

export const wagmiConfig = createConfig({
  chains: [sepolia, base],
  connectors: [
    injected(),
    ...(typeof window !== 'undefined' && process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
      ? [
          walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            showQrModal: true,
          }),
        ]
      : []),
  ],
  transports: {
    [sepolia.id]: fallback(sepoliaRpcs.map(url => http(url))),
    [base.id]: fallback(baseRpcs.map(url => http(url))),
  },
  ssr: false,
})
