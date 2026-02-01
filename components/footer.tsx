"use client"

import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const resourcesLinks = [
  { label: "Documentation", href: "https://altera-fi.gitbook.io/docs/documentation", external: true },
  { label: "Whitepaper", href: "https://altera-fi.gitbook.io/docs/whitepaper", external: true },
  { label: "Roadmap", href: "https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/roadmap", external: true },
  { label: "Protocol Overview", href: "https://altera-fi.gitbook.io/docs/documentation/protocol/swap", external: true },
  { label: "FAQ", href: "https://altera-fi.gitbook.io/docs/documentation/roadmap-and-faq/faq", external: true },
]

const communityLinks = [
  { label: "Twitter / X", href: "https://x.com/Altera619661", external: true },
  { label: "Discord", href: "https://discord.gg/TVz5EuyM4f", external: true },
  { label: "Telegram", href: "https://t.me/altera_fi", external: true },
  { label: "Contact", href: "/contact", external: false },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 lg:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {/* Logo and Description */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M12 2L22 12L12 22L2 12L12 2Z" className="text-foreground" />
                  </svg>
                </div>
                <span className="text-xl font-semibold text-foreground">Altera</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Orchestrate your entire on-chain portfolio from a single operating system.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
              <ul className="space-y-3">
                {resourcesLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      {link.external && <ExternalLink className="h-3 w-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Community</h4>
              <ul className="space-y-3">
                {communityLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      {link.external && <ExternalLink className="h-3 w-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Stay Updated</h4>
              <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-secondary/50 border-border focus:border-primary"
                />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Subscribe
                </Button>
                <p className="text-xs text-muted-foreground">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>&copy; {new Date().getFullYear()} Altera</span>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Testnet
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
