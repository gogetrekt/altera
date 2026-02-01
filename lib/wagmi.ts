import { http, createConfig, fallback } from 'wagmi'
import { sepolia, base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Multiple RPC endpoints with fallback support
// Wagmi will automatically try the next RPC if the first one fails
const sepoliaRpcs = [
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/2MrV99i8r3SyQQ3hSBkpA',
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL_INFURA || 'https://sepolia.infura.io/v3/3c7ff243cb5d4c7c998042a9d7bda05f',
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL_CHAINSTACK || 'https://ethereum-sepolia.core.chainstack.com/6f3f25027296a1c07a8962a976682abd',
]

// Base Mainnet RPC endpoints
const baseRpcs = [
  process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  process.env.NEXT_PUBLIC_BASE_RPC_URL_INFURA || 'https://base-mainnet.infura.io/v3/3c7ff243cb5d4c7c998042a9d7bda05f',
]

export const wagmiConfig = createConfig({
  chains: [sepolia, base],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      showQrModal: true,
    }),
  ],
  transports: {
    [sepolia.id]: fallback(sepoliaRpcs.map(url => http(url))),
    [base.id]: fallback(baseRpcs.map(url => http(url))),
  },
  ssr: true,
})
