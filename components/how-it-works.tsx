import { Shield, Zap, Lock } from "lucide-react"

const steps = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Non-custodial",
    description: "You maintain full control of your assets at all times. No intermediaries.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Testnet Ready",
    description: "Built on Ethereum Sepolia for safe exploration and development.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Ethereum-based",
    description: "Leveraging the security and ecosystem of the Ethereum network.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
            How Altera Works
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
