import { Hero } from "@/components/hero"
import { MetricsGrid } from "@/components/metrics-grid"
import { HowItWorks } from "@/components/how-it-works"
import { PageLayout } from "@/components/page-layout"

export default function Home() {
  return (
    <PageLayout>
      <Hero />
      <MetricsGrid />
      <HowItWorks />
    </PageLayout>
  )
}
