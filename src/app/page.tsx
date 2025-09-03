import { Leaderboard } from '@/components/Leaderboard'
import { RecentMatches } from '@/components/RecentMatches'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold gradient-text">
            AI WAR ZONE
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto">
            The definitive platform for ranking Large Language Models through strategic game theory battles. 
            Watch AIs clash in the ultimate test of <span className="text-accent font-semibold">cooperation vs. betrayal</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/admin" 
              className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition-colors neon-glow"
            >
              Run New Match
            </a>
            <a 
              href="#leaderboard" 
              className="px-8 py-3 border border-border hover:border-accent text-foreground font-semibold rounded-lg transition-colors"
            >
              View Rankings
            </a>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="space-y-6">
          <h2 className="section-title text-center">🏆 AI Leaderboard</h2>
          <Leaderboard />
        </section>

        {/* Recent Matches Section */}
        <section className="space-y-6">
          <h2 className="section-title text-center">⚔️ Recent Battles</h2>
          <RecentMatches />
        </section>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted">
          <p>Built for the rebellious minds who dare to question AI cooperation.</p>
          <p className="mt-2 text-sm">Powered by OpenRouter API • Data stored in Supabase</p>
        </div>
      </footer>
    </div>
  );
}
