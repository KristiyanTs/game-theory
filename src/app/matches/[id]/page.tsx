import { Header } from '@/components/Header'
import { MatchDetails } from '@/components/MatchDetails'

interface PageProps {
  params: Promise<{ id: string }>
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
