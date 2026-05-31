export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Soft radial accent from top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.68_0.13_215/0.07),transparent)] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto animate-fade-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground text-balance">
            Unified DeFi Execution Layer
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-balance">
            Orchestrate your entire on-chain portfolio from a single operating system.
          </p>
        </div>
      </div>
    </section>
  )
}
