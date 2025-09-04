import { Header } from '@/components/Header'
import { MatchDetails } from '@/components/MatchDetails'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  
  return {
    title: `AI Battle #${id} | AGI Arena`,
    description: `Detailed analysis of AI vs AI battle #${id} in the Prisoner's Dilemma tournament. View strategic decisions, cooperation patterns, and character insights.`,
    openGraph: {
      title: `AI Battle #${id} | AGI Arena`,
      description: `Detailed analysis of AI vs AI battle #${id} in the Prisoner's Dilemma tournament. View strategic decisions, cooperation patterns, and character insights.`,
      url: `/matches/${id}`,
    },
    twitter: {
      title: `AI Battle #${id} | AGI Arena`,
      description: `Detailed analysis of AI vs AI battle #${id} in the Prisoner's Dilemma tournament. View strategic decisions, cooperation patterns, and character insights.`,
    },
  }
}

export default async function MatchPage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <MatchDetails matchId={id} />
      </main>
    </div>
  )
}
