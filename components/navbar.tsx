"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ExternalLink, Wallet, LogOut, LayoutDashboard, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { sepolia } from 'wagmi/chains'


interface DropdownItem {
  label: string
  href: string
  external?: boolean
}

interface NavDropdown {
  label: string
  items: DropdownItem[]
}

const ecosystemItems: DropdownItem[] = [
  { label: "Swap", href: "/swap" },
  { label: "Liquidity", href: "/liquidity" },
  { label: "Staking", href: "/staking" },
  { label: "Perpetual", href: "/perpetual" },
  { label: "Bridge", href: "/bridge" },
]

const resourcesItems: DropdownItem[] = [
  { label: "Documentation", href: "https://altera-fi.gitbook.io/docs/documentation", external: true },
  { label: "Whitepaper", href: "https://altera-fi.gitbook.io/docs/whitepaper", external: true },
  { label: "Roadmap", href: "https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/roadmap", external: true },
  { label: "Protocol Overview", href: "https://altera-fi.gitbook.io/docs/documentation/protocol/swap", external: true },
  { label: "FAQ", href: "https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/faq", external: true },
]

const communityItems: DropdownItem[] = [
  { label: "Twitter / X", href: "https://x.com/alteraafi", external: true },
  { label: "Discord", href: "https://discord.gg/TVz5EuyM4f", external: true },
  { label: "Telegram", href: "https://t.me/altera_fi", external: true },
  { label: "GitBook", href: "https://altera-fi.gitbook.io/docs", external: true },
  { label: "Contact Us", href: "/contact" },
]

const dropdowns: NavDropdown[] = [
  { label: "Ecosystem", items: ecosystemItems },
  { label: "Resources", items: resourcesItems },
  { label: "Community", items: communityItems },
]

function NavDropdownMenu({ dropdown }: { dropdown: NavDropdown }) {
  const [isOpen, setIsOpen] = useState(false)
  let timeoutId: ReturnType<typeof setTimeout>

  const handleMouseEnter = () => {
    clearTimeout(timeoutId)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setIsOpen(false), 150)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
          "text-muted-foreground hover:text-foreground",
          isOpen && "text-foreground"
        )}
      >
        {dropdown.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>
      <div
        className={cn(
          "absolute left-0 top-full pt-2 z-50",
          "opacity-0 invisible translate-y-1 transition-all duration-200",
          isOpen && "opacity-100 visible translate-y-0"
        )}
      >
        <div className="min-w-[200px] rounded-lg border border-border bg-popover/95 backdrop-blur-xl p-2 shadow-xl">
          {dropdown.items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm",
                "text-muted-foreground hover:text-foreground hover:bg-secondary",
                "transition-colors"
              )}
            >
              {item.label}
              {item.external && <ExternalLink className="h-3 w-3 opacity-50" />}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isOpen, setIsOpen] = useState(false)
  let timeoutId: ReturnType<typeof setTimeout>

  // Token balances - use staleTime to prevent constant refetching
  const { data: ethBal } = useBalance({
    address: address as `0x${string}` | undefined,
    token: "0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9",
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const { data: usdcBal } = useBalance({
    address: address as `0x${string}` | undefined,
    token: "0xecefA4372C0cb1D103527d6350d10E1556657292",
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const { data: coreBal } = useBalance({
    address: address as `0x${string}` | undefined,
    token: "0x57eF4FB11A159791c5C935875f75b9970805DAFb",
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const handleMouseEnter = () => {
    if (isConnected) {
      clearTimeout(timeoutId)
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setIsOpen(false), 150)
  }

  if (!isConnected) {
    return (
      <Button
        size="sm"
        className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={() => {
          window.ethereum?.request({ method: 'eth_requestAccounts' })
        }}
      >
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          "flex items-center gap-2 h-9 px-4 rounded-lg",
          "bg-secondary hover:bg-secondary/80 transition-colors",
          "text-sm font-medium"
        )}
      >
        <span className="text-foreground">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary">
          Sepolia
        </span>
      </button>

      <div
        className={cn(
          "absolute right-0 top-full pt-2 z-50",
          "opacity-0 invisible translate-y-1 transition-all duration-200",
          isOpen && "opacity-100 visible translate-y-0"
        )}
      >
        <div className="min-w-[220px] rounded-lg border border-border bg-popover/95 backdrop-blur-xl p-3 shadow-xl">
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">dETH</span>
              <span className="text-foreground font-medium">
                {Number(ethBal?.formatted ?? 0).toFixed(4)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">dUSDC</span>
              <span className="text-foreground font-medium">
                {Number(usdcBal?.formatted ?? 0).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">CORE</span>
              <span className="text-foreground font-medium">
                {Number(coreBal?.formatted ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="h-px bg-border my-3" />

          <div className="space-y-2 mb-3">
            <div className="text-xs text-muted-foreground">
              Connected Wallet
            </div>
            <div className="font-mono text-sm break-all">
              {address}
            </div>
          </div>

          <div className="h-px bg-border my-3" />

          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>

            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M12 2L22 12L12 22L2 12L12 2Z" className="text-foreground" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-foreground">Altera</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {dropdowns.map((dropdown, index) => (
              <NavDropdownMenu key={index} dropdown={dropdown} />
            ))}
            <Link
              href="/dashboard"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/faucet"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Faucet
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/genesis"
              className="hidden md:flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:shadow-[0_0_16px_rgba(99,102,241,0.35)]"
            >
              <Sparkles className="h-4 w-4" />
              Genesis Pass
            </Link>
            <WalletButton />
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="space-y-2">
              {dropdowns.map((dropdown, index) => (
                <div key={index} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {dropdown.label}
                  </div>
                  {dropdown.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                      {item.external && <ExternalLink className="h-3 w-3 opacity-50" />}
                    </Link>
                  ))}
                </div>
              ))}
              <Link
                href="/dashboard"
                className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/faucet"
                className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Faucet
              </Link>
              <Link
                href="/genesis"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles className="h-4 w-4" />
                Genesis Pass
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
