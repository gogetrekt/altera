import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'

export function MinimalFooter() {
  return (
    <footer
      className="border-t border-border/40 py-3 px-4"
      aria-label="Page footer"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} Altera</span>
          <span className="text-border" aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-foreground transition-colors duration-150">
            Terms
          </Link>
          <span className="text-border" aria-hidden="true">·</span>
          <Link href="/privacy" className="hover:text-foreground transition-colors duration-150">
            Privacy
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <TriangleAlert
            className="h-3 w-3 text-zinc-600 shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-[10px] text-zinc-600 font-mono">
            Contracts are unaudited. Use at your own risk.
          </p>
        </div>
      </div>
    </footer>
  )
}
