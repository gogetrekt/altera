"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface-1">
        <div className="px-6 py-5 border-b border-border">
          <p className="text-base font-semibold text-foreground">Something went wrong</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. If this page involves a wallet connection, make sure your wallet is connected to the correct network.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono bg-surface-2 border border-border rounded px-3 py-2">
              Error ID: {error.digest}
            </p>
          )}
          <button
            className="w-full h-10 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors duration-150 cursor-pointer active:scale-[0.98]"
            onClick={reset}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
