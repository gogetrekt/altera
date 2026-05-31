import Link from 'next/link'
import { ExternalLink, TriangleAlert } from 'lucide-react'

const protocolLinks = [
  { label: 'Swap', href: '/swap' },
  { label: 'Liquidity', href: '/liquidity' },
  { label: 'Staking', href: '/staking' },
  { label: 'Faucet', href: '/faucet' },
  { label: 'Genesis Pass', href: '/genesis' },
  { label: 'Dashboard', href: '/dashboard' },
]

const resourceLinks = [
  { label: 'Documentation', href: 'https://altera-fi.gitbook.io/docs/documentation', external: true },
  { label: 'Whitepaper', href: 'https://altera-fi.gitbook.io/docs/whitepaper', external: true },
  { label: 'Roadmap', href: 'https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/roadmap', external: true },
  { label: 'FAQ', href: 'https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/faq', external: true },
]

const communityLinks = [
  { label: 'Twitter / X', href: 'https://x.com/alteraafi', external: true },
  { label: 'Discord', href: 'https://discord.gg/TVz5EuyM4f', external: true },
  { label: 'Telegram', href: 'https://t.me/altera_fi', external: true },
  { label: 'Contact', href: '/contact' },
]

const legalLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]

function FooterLinkList({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div>
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-3">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map(link => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {link.label}
              {link.external && (
                <ExternalLink className="h-3 w-3 opacity-30" strokeWidth={1.5} />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AlteraLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12,2 22,12 12,22 2,12" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-1" aria-label="Site footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <AlteraLogo className="h-5 w-5 text-foreground" />
              <span className="text-sm font-semibold font-mono tracking-tight text-foreground">ALTERA</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[22ch]">
              A testnet DeFi interface for Sepolia and Base. Contracts are unaudited.
            </p>
          </div>

          <FooterLinkList title="Protocol" links={protocolLinks} />
          <FooterLinkList title="Resources" links={resourceLinks} />
          <FooterLinkList title="Community" links={communityLinks} />
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} Altera</span>
              {legalLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-foreground transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Persistent audit disclaimer */}
            <div className="flex items-center gap-1.5">
              <TriangleAlert className="h-3 w-3 text-muted-foreground/50 shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <p className="text-[11px] text-muted-foreground/50 font-mono">
                Contracts are unaudited. Use at your own risk.
              </p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  )
}
