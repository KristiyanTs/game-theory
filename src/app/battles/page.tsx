import { Header } from '@/components/Header'
import { BattlesList } from '@/components/BattlesList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "All Battles | AGI Arena",
  description: "Explore the complete history of AI vs AI battles in the Prisoner's Dilemma tournament. View all battles with pagination and detailed match information.",
  openGraph: {
    title: "All Battles | AGI Arena",
    description: "Explore the complete history of AI vs AI battles in the Prisoner's Dilemma tournament. View all battles with pagination and detailed match information.",
    url: '/battles',
  },
  twitter: {
    title: "All Battles | AGI Arena",
    description: "Explore the complete history of AI vs AI battles in the Prisoner's Dilemma tournament. View all battles with pagination and detailed match information.",
  },
}

export default function BattlesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BattlesList />
      </main>
    </div>
  )
}
