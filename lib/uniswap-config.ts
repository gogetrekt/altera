// SimpleSwap contract address
export const SIMPLE_SWAP_ADDRESS = '0x52384F0fA5E28c3948C50f94Ed129cb130b98167'

export const UNISWAP_V3_ROUTER = '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E'
export const QUOTER_ADDRESS = '0xEd1f6473345F45b75F8179591dd5bA1888cf2FB3'
export const POOL_FEE = 3000

// Uniswap V3 Sepolia addresses
export const NONFUNGIBLE_POSITION_MANAGER = '0x1238536071E1c677A632429e3655c799b22cDA52'
export const POOL_ADDRESS = '0xF064fde809d3403D7d5d6d29Da445CCD7F6595A6'

// Faucet addresses
export const DETH_FAUCET_ADDRESS = '0xc0fc9dDA05803CA29e0eB44c104D17eC717435c8'
export const DUSDC_FAUCET_ADDRESS = '0x661A3e297a23Be077F6b3a3C5764773da4F3400e'

// Staking address
export const CORE_STAKING_ADDRESS = '0xe392f1F1029764D2b6A5fCdE9fc1CEE0f9D747E2'

export const TOKEN_ADDRESSES = {
  dETH: '0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9',
  dUSDC: '0xecefA4372C0cb1D103527d6350d10E1556657292',
  CORE: '0x57eF4FB11A159791c5C935875f75b9970805DAFb',
} as const

export const TOKEN_DECIMALS = {
  dETH: 18,
  dUSDC: 6,
} as const

// ERC20 ABI - minimal for approve and transfer
export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    name: 'allowance',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

// SimpleSwap ABI
export const SIMPLE_SWAP_ABI = [
  {
    name: 'swapETHForUSDC',
    type: 'function',
    inputs: [{ name: 'amountIn', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'swapUSDCForETH',
    type: 'function',
    inputs: [{ name: 'amountIn', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'rate',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'getReserves',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'dETHReserve', type: 'uint256' },
      { name: 'dUSDCReserve', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const

// Uniswap V3 SwapRouter ABI - exactInputSingle
export const SWAP_ROUTER_ABI = [
  {
    name: 'exactInputSingle',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
      },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'payable',
  },
] as const

// Uniswap V3 Quoter ABI - quoteExactInputSingle
export const QUOTER_ABI = [
  {
    name: 'quoteExactInputSingle',
    type: 'function',
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'sqrtPriceLimitX96', type: 'uint160' },
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
] as const

// Uniswap V3 Pool ABI
export const POOL_ABI = [
  {
    name: 'slot0',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    name: 'liquidity',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    name: 'token0',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'token1',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'fee',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint24' }],
    stateMutability: 'view',
  },
] as const

// NonfungiblePositionManager ABI
export const POSITION_MANAGER_ABI = [
  {
    name: 'mint',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'token0', type: 'address' },
          { name: 'token1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickLower', type: 'int24' },
          { name: 'tickUpper', type: 'int24' },
          { name: 'amount0Desired', type: 'uint256' },
          { name: 'amount1Desired', type: 'uint256' },
          { name: 'amount0Min', type: 'uint256' },
          { name: 'amount1Min', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'increaseLiquidity',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'amount0Desired', type: 'uint256' },
          { name: 'amount1Desired', type: 'uint256' },
          { name: 'amount0Min', type: 'uint256' },
          { name: 'amount1Min', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [
      { name: 'liquidity', type: 'uint128' },
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'decreaseLiquidity',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'liquidity', type: 'uint128' },
          { name: 'amount0Min', type: 'uint256' },
          { name: 'amount1Min', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
    ],
    outputs: [
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'collect',
    type: 'function',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'recipient', type: 'address' },
          { name: 'amount0Max', type: 'uint128' },
          { name: 'amount1Max', type: 'uint128' },
        ],
      },
    ],
    outputs: [
      { name: 'amount0', type: 'uint256' },
      { name: 'amount1', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
  {
    name: 'positions',
    type: 'function',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' },
    ],
    stateMutability: 'view',
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'burn',
    type: 'function',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable',
  },
] as const

// Tick spacing for different fee tiers
export const TICK_SPACINGS: { [fee: number]: number } = {
  500: 10,
  3000: 60,
  10000: 200,
}

// Full range ticks for 0.3% fee tier
export const MIN_TICK = -887220
export const MAX_TICK = 887220

// Faucet ABI
export const FAUCET_ABI = [
  {
    name: 'claim',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    // selector 0x5c16e15e - mapping of lastClaim timestamps
    name: 'lastClaim',
    type: 'function',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    // selector 0x9c281430 - faucetAmount (NOT claimAmount)
    name: 'faucetAmount',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    // selector for cooldown getter
    name: 'cooldown',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'token',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'owner',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'setFaucetAmount',
    type: 'function',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'setCooldown',
    type: 'function',
    inputs: [{ name: 'newCooldown', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

// CoreStaking ABI
export const CORE_STAKING_ABI = [
  {
    name: 'stake',
    type: 'function',
    inputs: [
      { name: '_poolId', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'unstake',
    type: 'function',
    inputs: [
      { name: '_poolId', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'claim',
    type: 'function',
    inputs: [{ name: '_poolId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'pendingReward',
    type: 'function',
    inputs: [
      { name: '_user', type: 'address' },
      { name: '_poolId', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'userInfo',
    type: 'function',
    inputs: [
      { name: '', type: 'uint256' },
      { name: '', type: 'address' },
    ],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'rewardDebt', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    name: 'pools',
    type: 'function',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'stakeToken', type: 'address' },
      { name: 'totalStaked', type: 'uint256' },
      { name: 'rewardRate', type: 'uint256' },
      { name: 'accRewardPerShare', type: 'uint256' },
      { name: 'lastRewardTime', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const