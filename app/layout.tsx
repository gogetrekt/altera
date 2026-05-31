import React from 'react'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from './providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
  themeColor: '#0d0f14',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
    >
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
