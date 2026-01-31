"use client"

import React from "react"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { MinimalFooter } from "@/components/minimal-footer"

interface PageLayoutProps {
  children: React.ReactNode
  showFooter?: boolean
  minimalFooter?: boolean
}

export function PageLayout({ children, showFooter = true, minimalFooter = false }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
      {showFooter && (minimalFooter ? <MinimalFooter /> : <Footer />)}
    </div>
  )
}
