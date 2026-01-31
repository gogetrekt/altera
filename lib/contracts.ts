export const CORE_TOKEN_ADDRESS =
  '0x57eF4FB11A159791c5C935875f75b9970805DAFb'

export const DUSDC_TOKEN_ADDRESS =
  '0xecefA4372C0cb1D103527d6350d10E1556657292'

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
]
