// Genesis Pass NFT Configuration
// Network: Base Mainnet
// Contract deployed via nfts2me

export const GENESIS_NFT_ADDRESS = '0x6dE73d8dF00c47CDE7D5F4756C08eFDE47778D21' as const

export const GENESIS_NFT_CONFIG = {
  address: GENESIS_NFT_ADDRESS,
  maxSupply: 500,
  price: '0.001', // Base price in ETH
  protocolFee: '0.00001', // nfts2me protocol fee
  totalPrice: '0.00101', // Total price to send (price + protocolFee)
  maxPerWallet: 1,
  chainId: 8453, // Base Mainnet
  chainName: 'Base',
} as const

// nfts2me Standard ABI (minimal functions needed)
export const GENESIS_NFT_ABI = [
  // Mint function
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  // Alternative mint function name (some nfts2me contracts use this)
  {
    name: 'mintNFT',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  // Total supply
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Balance of address
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Max supply
  {
    name: 'maxSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  // Owner of token
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  // Token URI
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  // Transfer event
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
] as const

// Type definitions
export interface GenesisNFTData {
  totalSupply: bigint
  maxSupply: number
  userBalance: bigint
  remaining: number
  mintedPercentage: number
  isSoldOut: boolean
  hasUserMinted: boolean
}
