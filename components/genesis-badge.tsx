"use client"

import { Sparkles } from "lucide-react"
import { useAccount, useReadContract } from "wagmi"
import { GENESIS_NFT_ADDRESS, GENESIS_NFT_ABI } from "@/lib/genesis-config"

interface GenesisBadgeProps {
  className?: string
  showTooltip?: boolean
}

export function GenesisBadge({ className = "", showTooltip = true }: GenesisBadgeProps) {
  const { address, isConnected } = useAccount()

  // Check if user owns Genesis Pass NFT
  const { data: genesisBalance } = useReadContract({
    address: GENESIS_NFT_ADDRESS,
    abi: GENESIS_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  })

  // Only show badge if user owns at least 1 Genesis Pass
  const isGenesisHolder = genesisBalance && genesisBalance > 0n

  // Don't render if not a genesis holder
  if (!isConnected || !isGenesisHolder) {
    return null
  }

  return (
    <div
      className={`group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 shadow-[0_0_12px_rgba(99,102,241,0.2)] ${className}`}
      title="Genesis Pass holder — early supporter of Altera"
    >
      <Sparkles className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium text-primary">Genesis Holder</span>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-popover border border-border text-xs text-muted-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          Genesis Pass holder — early supporter of Altera
        </div>
      )}
    </div>
  )
}

// Hook version for use in other components
export function useIsGenesisHolder(): boolean {
  const { address, isConnected } = useAccount()

  const { data: genesisBalance } = useReadContract({
    address: GENESIS_NFT_ADDRESS,
    abi: GENESIS_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 30000,
    },
  })

  return isConnected && !!genesisBalance && genesisBalance > 0n
}
