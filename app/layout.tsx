import React from 'react'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Altera | DeFi Execution Console',
    template: '%s | Altera',
  },
  description:
    'A testnet DeFi interface for swapping, staking, and liquidity on Sepolia. Contracts are unaudited. Use at your own risk.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0b0d13',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-sans antialiased text-foreground">
        <Providers>
          {children}
          <Toaster position="bottom-right" duration={5000} />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
