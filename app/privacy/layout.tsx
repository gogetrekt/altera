import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Altera",
  description: "Altera privacy policy: how we handle data and protect your information.",
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
