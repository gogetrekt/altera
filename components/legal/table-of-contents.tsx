"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [items])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Desktop TOC - Sticky Sidebar */}
      <nav className={cn(
        "hidden lg:block sticky top-24 h-fit",
        className
      )}>
        <div className="border border-border rounded-lg bg-card p-4">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <List className="h-4 w-4" />
            Table of Contents
          </h3>
          <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-muted-foreground/50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50">
            <ul className="space-y-1">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={cn(
                      "w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors",
                      "hover:bg-secondary hover:text-foreground",
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="mr-2 text-xs opacity-50">{index + 1}.</span>
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile TOC - Collapsible */}
      <div className="lg:hidden mb-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Table of Contents
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="border border-border rounded-lg bg-card p-4">
              <ul className="space-y-1">
                {items.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleClick(item.id)}
                      className={cn(
                        "w-full text-left text-sm py-2 px-3 rounded-md transition-colors",
                        "hover:bg-secondary hover:text-foreground",
                        activeSection === item.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <span className="mr-2 text-xs opacity-50">{index + 1}.</span>
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  )
}
