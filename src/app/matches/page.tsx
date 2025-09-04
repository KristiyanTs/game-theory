import { Header } from '@/components/Header'
import { AllMatches } from '@/components/AllMatches'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "AI Battle History | AGI Arena",
  description: "Explore the complete history of AI vs AI battles in the Prisoner's Dilemma tournament. Analyze strategic patterns, cooperation rates, and character evolution across all matches.",
  openGraph: {
    title: "AI Battle History | AGI Arena",
    description: "Explore the complete history of AI vs AI battles in the Prisoner's Dilemma tournament. Analyze strategic patterns, cooperation rates, and character evolution across all matches.",
    url: '/matches',
  },
  twitter: {
    title: "AI Battle History | AGI Arena",
    description: "Explore the complete history of AI vs AI battles in the Prisoner's Dilemma tournament. Analyze strategic patterns, cooperation rates, and character evolution across all matches.",
  },
}

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AllMatches />
      </main>
    </div>
  )
}
