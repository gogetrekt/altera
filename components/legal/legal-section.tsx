"use client"

import { cn } from "@/lib/utils"

interface LegalSectionProps {
  id: string
  title: string
  children: React.ReactNode
  className?: string
}

export function LegalSection({ id, title, children, className }: LegalSectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 mb-12", className)}
    >
      <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
        <span className="text-primary">#</span>
        {title}
      </h2>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  )
}

interface LegalSubsectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function LegalSubsection({ title, children, className }: LegalSubsectionProps) {
  return (
    <div className={cn("mt-6", className)}>
      <h3 className="text-xl font-medium text-foreground mb-3">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  )
}

interface LegalListProps {
  items: string[]
  ordered?: boolean
  className?: string
}

export function LegalList({ items, ordered = false, className }: LegalListProps) {
  const ListTag = ordered ? "ol" : "ul"
  return (
    <ListTag className={cn(
      "space-y-2 ml-6",
      ordered ? "list-decimal" : "list-disc",
      className
    )}>
      {items.map((item, index) => (
        <li key={index} className="text-muted-foreground">
          {item}
        </li>
      ))}
    </ListTag>
  )
}

interface LegalAlertProps {
  title: string
  children: React.ReactNode
  variant?: "warning" | "info" | "destructive"
}

export function LegalAlert({ title, children, variant = "warning" }: LegalAlertProps) {
  const variants = {
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
    info: "bg-primary/10 border-primary/30 text-primary",
    destructive: "bg-destructive/10 border-destructive/30 text-destructive",
  }

  const icons = {
    warning: "⚠️",
    info: "ℹ️",
    destructive: "🚨",
  }

  return (
    <div className={cn(
      "rounded-lg border p-4 my-6",
      variants[variant]
    )}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[variant]}</span>
        <div>
          <h4 className="font-semibold mb-2">{title}</h4>
          <div className="text-sm opacity-90">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

interface DefinitionProps {
  term: string
  definition: string
}

export function Definition({ term, definition }: DefinitionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 py-2 border-b border-border/50 last:border-0">
      <dt className="font-medium text-foreground min-w-[140px] shrink-0">"{term}"</dt>
      <dd className="text-muted-foreground">{definition}</dd>
    </div>
  )
}
