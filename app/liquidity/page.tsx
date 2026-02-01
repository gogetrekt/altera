"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Minus, Info, Wallet, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance, usePublicClient } from "wagmi"
import { parseUnits, formatUnits } from "viem"
import { sepolia } from "viem/chains"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
  NONFUNGIBLE_POSITION_MANAGER,
  POOL_ADDRESS,
  POOL_FEE,
  ERC20_ABI,
  POOL_ABI,
  POSITION_MANAGER_ABI,
  MIN_TICK,
  MAX_TICK,
} from "@/lib/uniswap-config"

// Position type
interface Position {
  tokenId: bigint
  liquidity: bigint
  token0: string
  token1: string
  fee: number
  tickLower: number
  tickUpper: number
  tokensOwed0: bigint
  tokensOwed1: bigint
}

// Helper to format amounts nicely
function formatAmount(value: bigint, decimals: number, maxDecimals = 6): string {
  const formatted = formatUnits(value, decimals)
  const num = parseFloat(formatted)
  if (num === 0) return "0"
  if (num < 0.000001) return "<0.000001"
  return num.toLocaleString(undefined, { maximumFractionDigits: maxDecimals })
}

export default function LiquidityPage() {
  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const [dethAmount, setDethAmount] = useState("")
  const [dusdcAmount, setDusdcAmount] = useState("")
  const [positions, setPositions] = useState<Position[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)
  const [closingPositionId, setClosingPositionId] = useState<bigint | null>(null)
  const [isClosingPosition, setIsClosingPosition] = useState(false)
  const [pendingCollectTokenId, setPendingCollectTokenId] = useState<bigint | null>(null)

  // Token balances
  const { data: dethBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES.dETH as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })
  
  const { data: dusdcBalance } = useBalance({
    address,
    token: TOKEN_ADDRESSES.dUSDC as `0x${string}`,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  // Pool slot0 for current price
  const { data: slot0 } = useReadContract({
    address: POOL_ADDRESS as `0x${string}`,
    abi: POOL_ABI,
    functionName: 'slot0',
    chainId: sepolia.id,
  })

  // Token order in pool
  const { data: token0Address } = useReadContract({
    address: POOL_ADDRESS as `0x${string}`,
    abi: POOL_ABI,
    functionName: 'token0',
    chainId: sepolia.id,
  })

  // Allowances
  const { data: dethAllowance, refetch: refetchDethAllowance } = useReadContract({
    address: TOKEN_ADDRESSES.dETH as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, NONFUNGIBLE_POSITION_MANAGER as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  const { data: dusdcAllowance, refetch: refetchDusdcAllowance } = useReadContract({
    address: TOKEN_ADDRESSES.dUSDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, NONFUNGIBLE_POSITION_MANAGER as `0x${string}`] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!address },
  })

  // User's LP position count
  const { data: positionCount, refetch: refetchPositionCount } = useReadContract({
    address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
    abi: POSITION_MANAGER_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Fetch all user positions
  const fetchPositions = useCallback(async () => {
    if (!address || !publicClient || !positionCount || positionCount === 0n) {
      setPositions([])
      return
    }

    setLoadingPositions(true)
    try {
      const positionPromises: Promise<Position | null>[] = []
      
      for (let i = 0n; i < positionCount; i++) {
        positionPromises.push(
          (async () => {
            try {
              // Get token ID
              const tokenId = await publicClient.readContract({
                address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
                abi: POSITION_MANAGER_ABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [address, i],
              } as any) as bigint

              // Get position details
              const positionData = await publicClient.readContract({
                address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
                abi: POSITION_MANAGER_ABI,
                functionName: 'positions',
                args: [tokenId],
              } as any) as readonly [bigint, `0x${string}`, `0x${string}`, `0x${string}`, number, number, number, bigint, bigint, bigint, bigint, bigint]

              return {
                tokenId,
                liquidity: positionData[7],
                token0: positionData[2],
                token1: positionData[3],
                fee: positionData[4],
                tickLower: positionData[5],
                tickUpper: positionData[6],
                tokensOwed0: positionData[10],
                tokensOwed1: positionData[11],
              }
            } catch {
              return null
            }
          })()
        )
      }

      const fetchedPositions = (await Promise.all(positionPromises)).filter((p): p is Position => p !== null)
      setPositions(fetchedPositions)
    } catch (error) {
      console.error('Error fetching positions:', error)
    } finally {
      setLoadingPositions(false)
    }
  }, [address, publicClient, positionCount])

  // Fetch positions when positionCount changes
  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

  // Write contract hooks
  const { writeContract, data: txHash, isPending, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Calculate current price from sqrtPriceX96
  const currentPrice = (() => {
    if (!slot0 || !token0Address) return 0
    const sqrtPriceX96 = slot0[0] as bigint
    const price = Number(sqrtPriceX96) ** 2 / 2 ** 192
    // If token0 is dETH, price is dUSDC per dETH, else invert
    const isDethToken0 = token0Address.toLowerCase() === TOKEN_ADDRESSES.dETH.toLowerCase()
    // Adjust for decimals: dETH has 18, dUSDC has 6
    const adjustedPrice = isDethToken0 ? price * 10 ** 12 : (1 / price) * 10 ** 12
    return adjustedPrice
  })()

  // Determine token order
  const isDethToken0 = token0Address?.toLowerCase() === TOKEN_ADDRESSES.dETH.toLowerCase()

  // Auto-calculate paired amount based on current price
  const handleDethChange = (value: string) => {
    setDethAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value)) && currentPrice > 0) {
      setDusdcAmount((Number.parseFloat(value) * currentPrice).toFixed(2))
    } else {
      setDusdcAmount("")
    }
  }

  const handleDusdcChange = (value: string) => {
    setDusdcAmount(value)
    if (value && !Number.isNaN(Number.parseFloat(value)) && currentPrice > 0) {
      setDethAmount((Number.parseFloat(value) / currentPrice).toFixed(6))
    } else {
      setDethAmount("")
    }
  }

  // Refetch on success
  useEffect(() => {
    if (isSuccess) {
      // Dismiss all loading toasts
      toast.dismiss("approve")
      toast.dismiss("add-liquidity")
      toast.dismiss("close-position")
      toast.dismiss("collect")
      
      // If we just finished decreaseLiquidity, now collect
      if (pendingCollectTokenId !== null) {
        // Auto collect after decreaseLiquidity
        writeContract({
          address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
          abi: POSITION_MANAGER_ABI,
          functionName: 'collect',
          args: [{
            tokenId: pendingCollectTokenId,
            recipient: address!,
            amount0Max: BigInt('0xffffffffffffffffffffffffffffffff'),
            amount1Max: BigInt('0xffffffffffffffffffffffffffffffff'),
          }],
          chain: sepolia,
          account: address,
        })
        toast.loading("Collecting tokens...", { id: "collect" })
        setPendingCollectTokenId(null)
        return
      }
      
      // If we were closing a position, now it's done
      if (isClosingPosition) {
        toast.success("Position closed successfully!")
        setIsClosingPosition(false)
        setClosingPositionId(null)
      } else {
        toast.success("Transaction confirmed!")
      }
      
      refetchDethAllowance()
      refetchDusdcAllowance()
      refetchPositionCount()
      // Reset write contract state to clear processing state
      reset()
      setDethAmount("")
      setDusdcAmount("")
      // Refetch positions after a short delay to allow chain to update
      setTimeout(() => {
        fetchPositions()
      }, 2000)
    }
  }, [isSuccess, reset, fetchPositions, pendingCollectTokenId, isClosingPosition, address])

  // Check if approval needed
  const dethAmountBN = dethAmount ? parseUnits(dethAmount, TOKEN_DECIMALS.dETH) : 0n
  const dusdcAmountBN = dusdcAmount ? parseUnits(dusdcAmount, TOKEN_DECIMALS.dUSDC) : 0n
  
  const needsDethApproval = dethAmountBN > 0n && (dethAllowance ?? 0n) < dethAmountBN
  const needsDusdcApproval = dusdcAmountBN > 0n && (dusdcAllowance ?? 0n) < dusdcAmountBN

  // Approve dETH
  const handleApproveDeth = () => {
    writeContract({
      address: TOKEN_ADDRESSES.dETH as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [NONFUNGIBLE_POSITION_MANAGER as `0x${string}`, dethAmountBN],
      chain: sepolia,
      account: address,
    })
    toast.loading("Approving dETH...", { id: "approve" })
  }

  // Approve dUSDC
  const handleApproveDusdc = () => {
    writeContract({
      address: TOKEN_ADDRESSES.dUSDC as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [NONFUNGIBLE_POSITION_MANAGER as `0x${string}`, dusdcAmountBN],
      chain: sepolia,
      account: address,
    })
    toast.loading("Approving dUSDC...", { id: "approve" })
  }

  // Add liquidity (mint new position)
  const handleAddLiquidity = () => {
    if (!address || dethAmountBN === 0n || dusdcAmountBN === 0n) return

    // Determine token order for mint params
    const amount0Desired = isDethToken0 ? dethAmountBN : dusdcAmountBN
    const amount1Desired = isDethToken0 ? dusdcAmountBN : dethAmountBN
    const token0 = isDethToken0 ? TOKEN_ADDRESSES.dETH : TOKEN_ADDRESSES.dUSDC
    const token1 = isDethToken0 ? TOKEN_ADDRESSES.dUSDC : TOKEN_ADDRESSES.dETH

    writeContract({
      address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
      abi: POSITION_MANAGER_ABI,
      functionName: 'mint',
      args: [{
        token0: token0 as `0x${string}`,
        token1: token1 as `0x${string}`,
        fee: POOL_FEE,
        tickLower: MIN_TICK,
        tickUpper: MAX_TICK,
        amount0Desired,
        amount1Desired,
        amount0Min: 0n, // No slippage protection for simplicity
        amount1Min: 0n,
        recipient: address,
        deadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 min
      }],
      chain: sepolia,
      account: address,
    })
    toast.loading("Adding liquidity...", { id: "add-liquidity" })
  }

  // Close position (decrease all liquidity + collect)
  const handleClosePosition = async (position: Position) => {
    if (!address || position.liquidity === 0n) return

    setClosingPositionId(position.tokenId)
    setIsClosingPosition(true)
    setPendingCollectTokenId(position.tokenId)
    
    try {
      // First, decrease liquidity to 0
      writeContract({
        address: NONFUNGIBLE_POSITION_MANAGER as `0x${string}`,
        abi: POSITION_MANAGER_ABI,
        functionName: 'decreaseLiquidity',
        args: [{
          tokenId: position.tokenId,
          liquidity: position.liquidity,
          amount0Min: 0n,
          amount1Min: 0n,
          deadline: BigInt(Math.floor(Date.now() / 1000) + 1800),
        }],
        chain: sepolia,
        account: address,
      })
      toast.loading("Removing liquidity...", { id: "close-position" })
    } catch (error) {
      console.error('Error closing position:', error)
      toast.error("Failed to close position")
      setClosingPositionId(null)
      setIsClosingPosition(false)
      setPendingCollectTokenId(null)
    }
  }

  const isValidAmount = dethAmount && Number.parseFloat(dethAmount) > 0 && dusdcAmount && Number.parseFloat(dusdcAmount) > 0
  const isAddLiquidityLoading = (isPending || isConfirming) && !isClosingPosition

  // Determine button state
  const getButtonContent = () => {
    if (!isConnected) return { text: "Connect Wallet", disabled: true }
    if (!isValidAmount) return { text: "Enter amounts", disabled: true }
    if (needsDethApproval) return { text: "Approve dETH", disabled: false, action: handleApproveDeth }
    if (needsDusdcApproval) return { text: "Approve dUSDC", disabled: false, action: handleApproveDusdc }
    return { text: "Add Liquidity", disabled: false, action: handleAddLiquidity }
  }

  const buttonState = getButtonContent()

  return (
    <PageLayout minimalFooter>
      <div className="py-12 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Liquidity</h1>
            <p className="text-muted-foreground mt-1">Provide liquidity to the dETH/dUSDC pool to earn fees</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Liquidity Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add Liquidity
                </CardTitle>
                <CardDescription>
                  dETH / dUSDC Pool • 0.3% Fee Tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Price */}
                <div className="rounded-lg bg-secondary/30 p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Current Price: <span className="text-foreground font-medium">1 dETH = {currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} dUSDC</span></span>
                  </div>
                </div>

                {/* dETH Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>dETH Amount</Label>
                    <span className="text-xs text-muted-foreground">
                      Balance: {dethBalance ? formatAmount(dethBalance.value, 18, 4) : "0"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={dethAmount}
                      onChange={(e) => handleDethChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => dethBalance && handleDethChange(formatUnits(dethBalance.value, 18))}
                    >
                      Max
                    </Button>
                  </div>
                  {needsDethApproval && dethAmountBN > 0n && (
                    <p className="text-xs text-yellow-500">Approval needed for dETH</p>
                  )}
                </div>

                {/* dUSDC Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>dUSDC Amount</Label>
                    <span className="text-xs text-muted-foreground">
                      Balance: {dusdcBalance ? formatAmount(dusdcBalance.value, 6, 2) : "0"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0.0"
                      value={dusdcAmount}
                      onChange={(e) => handleDusdcChange(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => dusdcBalance && handleDusdcChange(formatUnits(dusdcBalance.value, 6))}
                    >
                      Max
                    </Button>
                  </div>
                  {needsDusdcApproval && dusdcAmountBN > 0n && (
                    <p className="text-xs text-yellow-500">Approval needed for dUSDC</p>
                  )}
                </div>

                {/* Position Preview */}
                {isValidAmount && (
                  <div className="rounded-lg bg-secondary/30 p-4 space-y-3">
                    <h4 className="text-sm font-medium">Position Preview</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pair</span>
                        <p className="font-medium">dETH/dUSDC</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fee Tier</span>
                        <p className="font-medium">0.3%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Range</span>
                        <p className="font-medium">Full Range</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Value</span>
                        <p className="font-medium">
                          ~${((Number.parseFloat(dethAmount || "0") * currentPrice) + Number.parseFloat(dusdcAmount || "0")).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={buttonState.action}
                  disabled={buttonState.disabled || isAddLiquidityLoading || isClosingPosition}
                >
                  {isAddLiquidityLoading ? "Processing..." : buttonState.text}
                </Button>
              </CardContent>
            </Card>

            {/* Your Positions Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Your Positions</CardTitle>
                <CardDescription>
                  {positions.filter(p => p.liquidity > 0n).length > 0 
                    ? `${positions.filter(p => p.liquidity > 0n).length} active position${positions.filter(p => p.liquidity > 0n).length !== 1 ? "s" : ""}` 
                    : "No positions yet"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Connect wallet to view positions</p>
                  </div>
                ) : loadingPositions ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
                    <p>Loading positions...</p>
                  </div>
                ) : positions.filter(p => p.liquidity > 0n).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No active positions</p>
                    <p className="text-sm mt-1">Add liquidity to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {positions.filter(p => p.liquidity > 0n).map((position) => {
                        const isClosing = closingPositionId === position.tokenId
                        
                        return (
                          <div key={position.tokenId.toString()} className="rounded-lg bg-secondary/30 p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">dETH/dUSDC</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{position.fee / 10000}%</Badge>
                                <Badge variant="default">Active</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Token ID</span>
                                <p className="font-medium">#{position.tokenId.toString()}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Range</span>
                                <p className="font-medium">
                                  {position.tickLower === MIN_TICK && position.tickUpper === MAX_TICK 
                                    ? "Full Range" 
                                    : `${position.tickLower} - ${position.tickUpper}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleClosePosition(position)}
                                disabled={isClosing || isClosingPosition}
                              >
                                {isClosing ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    Closing...
                                  </>
                                ) : (
                                  <>
                                    <X className="h-4 w-4 mr-1" />
                                    Close Position
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pool Info */}
          <Card className="mt-6 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Pool Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Pool Address</span>
                  <p className="font-mono text-xs mt-1 truncate">{POOL_ADDRESS}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Fee Tier</span>
                  <p className="font-medium mt-1">0.3%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Price</span>
                  <p className="font-medium mt-1">1 dETH = {currentPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} dUSDC</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Network</span>
                  <p className="font-medium mt-1">Sepolia Testnet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
