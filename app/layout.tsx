import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Altera | Unified DeFi Execution Layer',
  description:
    'Orchestrate your entire on-chain portfolio from a single operating system. Altera is the unified DeFi execution layer.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d12',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster position="bottom-right" duration={5000} />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
