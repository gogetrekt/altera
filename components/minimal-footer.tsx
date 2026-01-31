import Link from "next/link"

export function MinimalFooter() {
  return (
    <footer className="border-t border-border/30 py-3 px-4">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>&copy; 2026 Altera</span>
        <span className="text-border">·</span>
        <Link href="/terms" className="hover:text-foreground transition-colors">
          Terms
        </Link>
        <span className="text-border">·</span>
        <Link href="/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </Link>
        <span className="text-border">·</span>
        <span className="text-primary/80">Testnet</span>
      </div>
    </footer>
  )
}
