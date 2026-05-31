"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, List } from "lucide-react"

export interface TOCItem {
  id: string
  title: string
}

interface TableOfContentsProps {
  items: TOCItem[]
  className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )
    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    setIsOpen(false)
  }

  const NavList = () => (
    <ul className="space-y-0.5">
      {items.map((item, index) => (
        <li key={item.id}>
          <button
            onClick={() => handleClick(item.id)}
            className={cn(
              "w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors duration-150 cursor-pointer",
              "hover:bg-surface-3 hover:text-foreground",
              activeSection === item.id
                ? "bg-primary/8 text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <span className="mr-2 text-xs opacity-40 font-mono">{index + 1}.</span>
            {item.title}
          </button>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Desktop TOC — sticky sidebar */}
      <nav className={cn("hidden lg:block sticky top-24 h-fit", className)}>
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <h3 className="text-xs font-mono uppercase tracking-wide text-muted-foreground/60 mb-3 flex items-center gap-2">
            <List className="h-3.5 w-3.5" strokeWidth={1.5} />
            Contents
          </h3>
          <div className="max-h-[calc(100svh-14rem)] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-border-strong">
            <NavList />
          </div>
        </div>
      </nav>

      {/* Mobile TOC — native disclosure */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(v => !v)}
          className="w-full flex items-center justify-between h-10 px-4 rounded-md border border-border bg-surface-1 text-sm text-muted-foreground hover:bg-surface-2 hover:text-foreground transition-colors duration-150 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4" strokeWidth={1.5} />
            Table of Contents
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} strokeWidth={1.5} />
        </button>
        {isOpen && (
          <div className="mt-2 rounded-lg border border-border bg-surface-1 p-3">
            <NavList />
          </div>
        )}
      </div>
    </>
  )
}
