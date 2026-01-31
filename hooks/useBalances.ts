'use client'

import { useAccount, useBalance, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import {
  CORE_TOKEN_ADDRESS,
  DUSDC_TOKEN_ADDRESS,
  ERC20_ABI,
} from '@/lib/contracts'

export function useBalances() {
  const { address } = useAccount()

  // ETH
  const { data: eth } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  })

  // CORE
  const { data: coreRaw } = useReadContract({
    address: CORE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  })

  const { data: coreDecimals } = useReadContract({
    address: CORE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  // dUSDC
  const { data: usdcRaw } = useReadContract({
    address: DUSDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  })

  const { data: usdcDecimals } = useReadContract({
    address: DUSDC_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'decimals',
  })

  return {
    eth: eth?.formatted ?? '0',
    core:
      coreRaw && coreDecimals
        ? formatUnits(coreRaw as bigint, coreDecimals as number)
        : '0',
    usdc:
      usdcRaw && usdcDecimals
        ? formatUnits(usdcRaw as bigint, usdcDecimals as number)
        : '0',
  }
}
