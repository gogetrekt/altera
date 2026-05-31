import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Altera",
  description: "Altera terms of service: conditions for using the Altera DeFi platform.",
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
