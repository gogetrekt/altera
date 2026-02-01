"use client"

import Link from "next/link"
import { ChevronRight, FileText, Calendar, Printer } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { TableOfContents, TOCItem } from "./table-of-contents"

interface LegalLayoutProps {
  title: string
  description: string
  lastUpdated: string
  sections: TOCItem[]
  children: React.ReactNode
}

export function LegalLayout({
  title,
  description,
  lastUpdated,
  sections,
  children,
}: LegalLayoutProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <PageLayout minimalFooter>
      <div className="py-8 px-4">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{title}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="print:hidden w-fit"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {description}
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Main Content with TOC */}
          <div className="flex gap-8">
            {/* TOC Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <TableOfContents items={sections} />
            </aside>

            {/* Content */}
            <main className="flex-1 min-w-0">
              {/* Mobile TOC */}
              <div className="lg:hidden">
                <TableOfContents items={sections} />
              </div>

              {/* Legal Content */}
              <div className="prose prose-invert max-w-none">
                {children}
              </div>

              {/* Footer Navigation */}
              <div className="mt-16 pt-8 border-t border-border print:hidden">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Questions about this document?</p>
                    <a 
                      href="mailto:legal@altera.io" 
                      className="text-primary hover:underline"
                    >
                      Contact us at legal@altera.io
                    </a>
                  </div>
                  <div className="flex gap-4">
                    <Link href="/terms">
                      <Button variant="outline" size="sm">
                        Terms of Service
                      </Button>
                    </Link>
                    <Link href="/privacy">
                      <Button variant="outline" size="sm">
                        Privacy Policy
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          * {
            color: black !important;
            border-color: #ccc !important;
          }
        }
      `}</style>
    </PageLayout>
  )
}
