import { Header } from '@/components/Header'
import { AllMatches } from '@/components/AllMatches'

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
