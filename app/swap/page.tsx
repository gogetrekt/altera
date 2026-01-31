"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowDownUp, ChevronDown, Settings } from "lucide-react"
import { toast } from "sonner"
import { parseUnits, formatUnits } from "viem"
import {
  useAccount,
  useBalance,
  useWriteContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  UNISWAP_V3_ROUTER,
  QUOTER_ADDRESS,
  POOL_FEE,
  TOKEN_ADDRESSES,
  TOKEN_DECIMALS,
  ERC20_ABI,
  SWAP_ROUTER_ABI,
  QUOTER_ABI,
} from "@/lib/uniswap-config"

const tokens = [
  { symbol: "dETH", name: "Dummy Ethereum", address: TOKEN_ADDRESSES.dETH },
  { symbol: "dUSDC", name: "Dummy USD Coin", address: TOKEN_ADDRESSES.dUSDC },
]

const slippageOptions = ["0.1%", "0.5%", "1.0%"]

export default function SwapPage() {
  const { address } = useAccount()
  const [fromToken, setFromToken] = useState(tokens[0])
  const [toToken, setToToken] = useState(tokens[1])
  const [fromAmount, setFromAmount] = useState("")
  const [slippage, setSlippage] = useState("0.5%")
  const [isLoading, setIsLoading] = useState(false)
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | null>(null)
  const [swapTxHash, setSwapTxHash] = useState<`0x${string}` | null>(null)
  const processedSwapRef = useRef<string | null>(null)

  const { data: fromTokenBalance } = useBalance({
    address,
    token: fromToken.address as `0x${string}`,
  })

  const { data: toTokenBalance } = useBalance({
    address,
    token: toToken.address as `0x${string}`,
  })

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address
      ? [address, UNISWAP_V3_ROUTER as `0x${string}`]
      : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 3000,
    },
  })

  const sanitizedFromAmount = fromAmount.replace(/[^\d.]/g, '')
  const fromAmountInWei = sanitizedFromAmount
    ? parseUnits(sanitizedFromAmount, TOKEN_DECIMALS[fromToken.symbol as keyof typeof TOKEN_DECIMALS])
    : 0n

  const needsApproval =
    fromAmountInWei > 0n &&
    allowance !== undefined &&
    allowance < fromAmountInWei

  // Calculate toAmount using fixed rate: 1 dETH = 2953 dUSDC
  const toAmountInWei =
    sanitizedFromAmount && fromAmountInWei > 0n
      ? fromToken.symbol === "dETH"
        // dETH (18) -> dUSDC (6)
        ? (fromAmountInWei * 2953n) / 10n ** 12n
        // dUSDC (6) -> dETH (18)
        : (fromAmountInWei * 10n ** 12n) / 2953n
      : 0n

  const toAmount =
    toAmountInWei > 0n && fromAmount
      ? formatUnits(toAmountInWei, TOKEN_DECIMALS[toToken.symbol as keyof typeof TOKEN_DECIMALS])
      : ""

  const minimumReceived =
    toAmount && slippage
      ? (
          Number.parseFloat(toAmount) * (1 - Number.parseFloat(slippage) / 100)
        ).toFixed(TOKEN_DECIMALS[toToken.symbol as keyof typeof TOKEN_DECIMALS])
      : ""

  const switchTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount("")
  }

  const { data: approveSimulation } = useSimulateContract(
    address && needsApproval && fromAmountInWei > 0n
      ? {
          account: address,
          address: fromToken.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [UNISWAP_V3_ROUTER as `0x${string}`, fromAmountInWei],
        }
      : undefined,
  )

  const { writeContractAsync: writeApprove } = useWriteContract()

  const minimumReceivedInWei = minimumReceived
    ? parseUnits(minimumReceived, TOKEN_DECIMALS[toToken.symbol as keyof typeof TOKEN_DECIMALS])
    : 0n

  const { data: swapSimulation } = useSimulateContract(
    address && !needsApproval && fromAmountInWei > 0n && toAmountInWei > 0n
      ? {
          account: address,
          address: UNISWAP_V3_ROUTER as `0x${string}`,
          abi: SWAP_ROUTER_ABI,
          functionName: 'exactInputSingle',
          args: [
            {
              tokenIn: fromToken.address as `0x${string}`,
              tokenOut: toToken.address as `0x${string}`,
              fee: POOL_FEE,
              recipient: address,
              deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20),
              amountIn: fromAmountInWei,
              amountOutMinimum: minimumReceivedInWei,
              sqrtPriceLimitX96: 0n,
            },
          ],
        }
      : undefined,
  )

  const { writeContractAsync: writeSwap } = useWriteContract()

  const { data: approvalReceipt, isLoading: isApprovalPending } = useWaitForTransactionReceipt({
    hash: approvalTxHash || undefined,
  })

  const { data: swapReceipt, isLoading: isSwapPending } = useWaitForTransactionReceipt({
    hash: swapTxHash || undefined,
  })

  useEffect(() => {
    if (approvalReceipt?.status === "success") {
      toast.success("Token approved successfully!", { id: "approve" })
      setApprovalTxHash(null)
      setIsLoading(false)
      refetchAllowance()
    }
  }, [approvalReceipt, refetchAllowance])

  useEffect(() => {
    if (
      swapReceipt && 
      swapReceipt.status === 'success' && 
      swapReceipt.transactionHash !== processedSwapRef.current
    ) {
      processedSwapRef.current = swapReceipt.transactionHash
      toast.success(
        `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        { id: "swap" }
      )
      setFromAmount("")
      setSwapTxHash(null)
      setIsLoading(false)
    }
  }, [swapReceipt, fromAmount, fromToken.symbol, toAmount, toToken.symbol])

  const handleApprove = async () => {
    if (!approveSimulation?.request) return
    try {
      setIsLoading(true)
      toast.loading("Waiting for token approval...", { id: "approve" })
      const hash = await writeApprove(approveSimulation.request)
      setApprovalTxHash(hash)
    } catch (error) {
      console.error(error)
      setApprovalTxHash(null)
      toast.error("Approval failed. Please try again.", { id: "approve" })
      setIsLoading(false)
    }
  }

  const handleSwap = async () => {
    if (!swapSimulation?.request) return
    try {
      setIsLoading(true)
      toast.loading("Waiting for swap confirmation...", { id: "swap" })
      const hash = await writeSwap(swapSimulation.request)
      setSwapTxHash(hash)
    } catch (error) {
      console.error(error)
      setSwapTxHash(null)
      toast.error("Swap failed. Please try again.", { id: "swap" })
      setIsLoading(false)
    }
  }

  const isValidAmount = fromAmount && Number.parseFloat(fromAmount) > 0

  return (
    <PageLayout minimalFooter>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-xl">Swap</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Slippage</div>
                {slippageOptions.map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => setSlippage(option)}
                    className={slippage === option ? "bg-secondary" : ""}
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>From</span>
                <span>Balance: {fromTokenBalance ? formatUnits(fromTokenBalance.value, fromTokenBalance.decimals) : "0"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="flex-1 bg-transparent border-0 text-2xl font-medium p-0 h-auto focus-visible:ring-0"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                      {fromToken.symbol}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {tokens.map((token) => (
                      <DropdownMenuItem
                        key={token.symbol}
                        onClick={() => {
                          setFromToken(token)
                        }}
                        disabled={token.symbol === toToken.symbol}
                      >
                        <span className="font-medium">{token.symbol}</span>
                        <span className="ml-2 text-muted-foreground">{token.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-primary"
                onClick={() => {
                  if (fromTokenBalance) {
                    setFromAmount(formatUnits(fromTokenBalance.value, fromTokenBalance.decimals))
                  }
                }}
              >
                Max
              </Button>
            </div>

            <div className="flex justify-center -my-1">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full border-border bg-background"
                onClick={switchTokens}
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>To (estimated)</span>
                <span>Balance: {toTokenBalance ? formatUnits(toTokenBalance.value, toTokenBalance.decimals) : "0"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 text-2xl font-medium text-muted-foreground">
                  {toAmount || "0.0"}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="gap-2">
                      {toToken.symbol}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {tokens.map((token) => (
                      <DropdownMenuItem
                        key={token.symbol}
                        onClick={() => setToToken(token)}
                        disabled={token.symbol === fromToken.symbol}
                      >
                        <span className="font-medium">{token.symbol}</span>
                        <span className="ml-2 text-muted-foreground">{token.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {isValidAmount && (
              <div className="rounded-lg bg-secondary/30 p-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Slippage tolerance</span>
                  <span>{slippage}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Minimum received</span>
                  <span>{minimumReceived} {toToken.symbol}</span>
                </div>
              </div>
            )}

            {needsApproval && isValidAmount ? (
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleApprove}
                disabled={isApprovalPending || !approveSimulation?.request}
              >
                {isApprovalPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Waiting token approval...
                  </>
                ) : (
                  `Approve ${fromToken.symbol}`
                )}
              </Button>
            ) : (
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSwap}
                disabled={!isValidAmount || isSwapPending || !swapSimulation?.request}
              >
                {isSwapPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Waiting swap confirmation...
                  </>
                ) : (
                  "Swap"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
