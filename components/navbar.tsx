'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  ExternalLink,
  Wallet,
  LogOut,
  LayoutDashboard,
  Copy,
  Check,
  X,
  Menu,
  TriangleAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { useAccount, useDisconnect, useBalance, useConnect, useChainId } from 'wagmi'
import { sepolia, base } from 'wagmi/chains'

// ---------------------------------------------------------------------------
// Nav data
// ---------------------------------------------------------------------------

interface NavItem {
  label: string
  href: string
  external?: boolean
  badge?: 'coming-soon' | 'simulation' | 'mainnet'
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const ecosystemItems: NavItem[] = [
  { label: 'Swap', href: '/swap' },
  { label: 'Liquidity', href: '/liquidity' },
  { label: 'Staking', href: '/staking' },
  { label: 'Perpetual', href: '/perpetual', badge: 'simulation' },
  { label: 'Bridge', href: '/bridge', badge: 'coming-soon' },
]

const resourcesItems: NavItem[] = [
  { label: 'Documentation', href: 'https://altera-fi.gitbook.io/docs/documentation', external: true },
  { label: 'Whitepaper', href: 'https://altera-fi.gitbook.io/docs/whitepaper', external: true },
  { label: 'Roadmap', href: 'https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/roadmap', external: true },
  { label: 'Protocol Overview', href: 'https://altera-fi.gitbook.io/docs/documentation/protocol/swap', external: true },
  { label: 'FAQ', href: 'https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/faq', external: true },
]

const communityItems: NavItem[] = [
  { label: 'Twitter / X', href: 'https://x.com/alteraafi', external: true },
  { label: 'Discord', href: 'https://discord.gg/TVz5EuyM4f', external: true },
  { label: 'Telegram', href: 'https://t.me/altera_fi', external: true },
  { label: 'GitBook', href: 'https://altera-fi.gitbook.io/docs', external: true },
  { label: 'Contact', href: '/contact' },
]

const navGroups: NavGroup[] = [
  { label: 'Ecosystem', items: ecosystemItems },
  { label: 'Resources', items: resourcesItems },
  { label: 'Community', items: communityItems },
]

// ---------------------------------------------------------------------------
// Chain label helper
// ---------------------------------------------------------------------------

function getChainLabel(chainId: number | undefined): { label: string; color: string } {
  if (!chainId) return { label: 'Unknown', color: 'text-zinc-500' }
  if (chainId === sepolia.id) return { label: 'Sepolia', color: 'text-amber-400' }
  if (chainId === base.id) return { label: 'Base', color: 'text-blue-400' }
  return { label: `Chain ${chainId}`, color: 'text-red-400' }
}

// ---------------------------------------------------------------------------
// Dropdown menu
// ---------------------------------------------------------------------------

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleEnter = () => {
    clearTimeout(timeoutRef.current)
    setOpen(true)
  }
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={cn(
          'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded',
          'text-muted-foreground hover:text-foreground',
          'transition-colors duration-150 cursor-pointer',
          open && 'text-foreground',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {group.label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>

      <div
        className={cn(
          'absolute left-0 top-full pt-2 z-50 transition-all duration-200',
          open
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible translate-y-1 pointer-events-none',
        )}
        role="menu"
      >
        <div className="min-w-50 rounded-md border border-border bg-popover/95 backdrop-blur-xl p-1.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)]">
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              role="menuitem"
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded text-sm',
                'text-muted-foreground hover:text-foreground hover:bg-secondary',
                'transition-colors duration-150 cursor-pointer',
              )}
            >
              <span>{item.label}</span>
              <span className="flex items-center gap-1.5">
                {item.badge === 'simulation' && (
                  <span className="text-[10px] text-yellow-500 font-mono uppercase tracking-wide">sim</span>
                )}
                {item.badge === 'coming-soon' && (
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">soon</span>
                )}
                {item.badge === 'mainnet' && (
                  <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wide">mainnet</span>
                )}
                {item.external && (
                  <ExternalLink className="h-3 w-3 opacity-40" strokeWidth={1.5} />
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wallet button
// ---------------------------------------------------------------------------

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { connect, connectors } = useConnect()
  const chainId = useChainId()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const chain = getChainLabel(chainId)

  const { data: ethBal } = useBalance({
    address: address as `0x${string}` | undefined,
    token: '0x277cE9d3a6A7c43810FC57fD8254435273c4DAD9',
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })
  const { data: usdcBal } = useBalance({
    address: address as `0x${string}` | undefined,
    token: '0xecefA4372C0cb1D103527d6350d10E1556657292',
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })
  const { data: coreBal } = useBalance({
    address: address as `0x${string}` | undefined,
    token: '0x57eF4FB11A159791c5C935875f75b9970805DAFb',
    chainId: sepolia.id,
    query: { staleTime: 30000, refetchInterval: 60000, enabled: !!address },
  })

  const handleEnter = () => {
    if (isConnected) {
      clearTimeout(timeoutRef.current)
      setOpen(true)
    }
  }
  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  const handleConnect = () => {
    const injected = connectors.find(c => c.id === 'injected') ?? connectors[0]
    if (injected) connect({ connector: injected })
  }

  if (!isConnected) {
    return (
      <Button
        size="sm"
        onClick={handleConnect}
        className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer active:press"
      >
        <Wallet className="h-4 w-4 mr-2" strokeWidth={1.5} />
        Connect Wallet
      </Button>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={cn(
          'flex items-center gap-2 h-9 px-3 rounded-md cursor-pointer',
          'bg-secondary hover:bg-secondary/80 border border-border/60',
          'text-sm font-medium transition-colors duration-150',
        )}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="font-data text-foreground text-xs">
          {address?.slice(0, 6)}&hellip;{address?.slice(-4)}
        </span>
        <span
          className={cn(
            'px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide',
            chainId === sepolia.id && 'bg-amber-500/10 text-amber-400',
            chainId === base.id && 'bg-blue-500/10 text-blue-400',
            chainId !== sepolia.id && chainId !== base.id && 'bg-red-500/10 text-red-400',
          )}
        >
          {chain.label}
        </span>
      </button>

      <div
        className={cn(
          'absolute right-0 top-full pt-2 z-50 transition-all duration-200',
          open
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible translate-y-1 pointer-events-none',
        )}
      >
        <div className="w-56 rounded-md border border-border bg-popover/95 backdrop-blur-xl p-3 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] space-y-3">
          {/* Balances */}
          <div className="space-y-1.5">
            {[
              { label: 'dETH', value: Number(ethBal?.formatted ?? 0).toFixed(4) },
              { label: 'dUSDC', value: Number(usdcBal?.formatted ?? 0).toFixed(2) },
              { label: 'CORE', value: Number(coreBal?.formatted ?? 0).toFixed(2) },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-data text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-border" />

          {/* Address */}
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono">Connected wallet</p>
            <div className="flex items-center justify-between gap-2">
              <p className="font-data text-xs text-foreground truncate">{address}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                aria-label="Copy address"
              >
                {copied
                  ? <Check className="h-3.5 w-3.5 text-green-400" strokeWidth={1.5} />
                  : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                }
              </button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Actions */}
          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
            >
              <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.5} />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => disconnect()}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile drawer
// ---------------------------------------------------------------------------

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2" onClick={onClose}>
            <AlteraLogo className="h-5 w-5" />
            <span className="text-lg font-semibold">Altera</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Nav content */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    onClick={onClose}
                    className="flex items-center justify-between px-2 py-2 rounded text-sm text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <span className="flex items-center gap-1.5">
                      {item.badge === 'simulation' && (
                        <span className="text-[10px] text-yellow-500 font-mono">sim</span>
                      )}
                      {item.badge === 'coming-soon' && (
                        <span className="text-[10px] text-zinc-500 font-mono">soon</span>
                      )}
                      {item.external && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground/40" strokeWidth={1.5} />
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="h-px bg-border" />

          <div className="space-y-0.5">
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center px-2 py-2 rounded text-sm text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
            >
              Dashboard
            </Link>
            <Link
              href="/faucet"
              onClick={onClose}
              className="flex items-center px-2 py-2 rounded text-sm text-foreground hover:bg-secondary transition-colors duration-150 cursor-pointer"
            >
              Faucet
            </Link>
            <Link
              href="/genesis"
              onClick={onClose}
              className="flex items-center justify-between px-2 py-2 rounded text-sm text-amber-400 bg-amber-500/8 hover:bg-amber-500/12 transition-colors duration-150 cursor-pointer"
            >
              <span>Genesis Pass</span>
              <span className="text-[10px] font-mono uppercase tracking-wide text-amber-500">Mainnet</span>
            </Link>
          </div>
        </nav>

        {/* Footer disclaimer */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-3 w-3 text-zinc-500 shrink-0" strokeWidth={1.5} />
            <p className="text-[10px] text-zinc-500 leading-snug">
              Contracts are unaudited. Use at your own risk.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Logo
// ---------------------------------------------------------------------------

function AlteraLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Main Navbar
// ---------------------------------------------------------------------------

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Left: Logo + Desktop Nav */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 shrink-0">
                <AlteraLogo className="h-5 w-5 text-foreground" />
                <span className="text-lg font-semibold text-foreground tracking-tight">Altera</span>
              </Link>

              <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
                {navGroups.map(group => (
                  <NavDropdown key={group.label} group={group} />
                ))}
                <Link
                  href="/dashboard"
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded transition-colors duration-150',
                    pathname === '/dashboard'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Dashboard
                </Link>
                <Link
                  href="/faucet"
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded transition-colors duration-150',
                    pathname === '/faucet'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Faucet
                </Link>
              </nav>
            </div>

            {/* Right: Testnet badge + Genesis + Wallet + Mobile toggle */}
            <div className="flex items-center gap-2">
              {/* Persistent testnet badge */}
              <StatusBadge variant="testnet" label="Testnet" className="hidden sm:inline-flex" />

              {/* Genesis Pass CTA */}
              <Link
                href="/genesis"
                className={cn(
                  'hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium',
                  'bg-amber-500/10 text-amber-400 border border-amber-500/30',
                  'hover:bg-amber-500/15 transition-colors duration-150 cursor-pointer',
                )}
              >
                Genesis Pass
              </Link>

              <WalletButton />

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
