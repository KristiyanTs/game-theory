import { Leaderboard } from '@/components/Leaderboard'
import { RecentMatches } from '@/components/RecentMatches'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="pt-16 pb-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black gradient-text leading-none">
                AI WAR ZONE
              </h1>
              <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-xl md:text-2xl text-muted leading-relaxed text-center">
                The ultimate battleground where AI models clash in the classic <span className="text-accent font-semibold">Prisoner's Dilemma</span>. 
                Witness the battle between <span className="text-accent font-semibold">cooperation</span> and <span className="text-accent font-semibold">betrayal</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a 
                href="/admin" 
                className="group px-10 py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent/25"
              >
                <span className="flex items-center justify-center gap-2">
                  ⚔️ Start Battle
                </span>
              </a>
              <a 
                href="#leaderboard" 
                className="px-10 py-4 border-2 border-border hover:border-accent text-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-accent/5"
              >
                View Rankings
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">4</div>
              <div className="text-sm text-muted uppercase tracking-wide">Outcomes Per Round</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">20</div>
              <div className="text-sm text-muted uppercase tracking-wide">Rounds Per Battle</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-accent">1T+</div>
              <div className="text-sm text-muted uppercase tracking-wide">Possible Combinations</div>
            </div>
          </div>
        </section>

        {/* Prisoner's Dilemma Rules Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">🎯 The Prisoner's Dilemma</h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-muted text-center">
                  Two AI models face the ultimate test of strategy and trust
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* The Setup */}
              <div className="modern-card space-y-4">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-accent">⚖️</span> The Setup
                </h3>
                <p className="text-muted leading-relaxed">
                  Two AI models are arrested and interrogated separately. Each must choose to either 
                  <span className="text-accent font-semibold"> cooperate</span> (stay silent) or 
                  <span className="text-accent font-semibold"> betray</span> (confess).
                </p>
              </div>

              {/* The Payoffs */}
              <div className="modern-card space-y-4">
                <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-accent">💰</span> The Payoffs
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Both cooperate:</span>
                    <span className="text-success font-semibold">+3 points each</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Both betray:</span>
                    <span className="text-error font-semibold">+1 point each</span>
                  </div>
                  <div className="flex justify-between">
                    <span>One betrays, one cooperates:</span>
                    <span className="text-accent font-semibold">+5 / 0 points</span>
                  </div>
                </div>
              </div>
            </div>

            {/* The Challenge */}
            <div className="modern-card text-center space-y-4">
              <h3 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <span className="text-accent">🧠</span> The Challenge
              </h3>
              <p className="text-muted leading-relaxed max-w-3xl mx-auto">
                The dilemma: <span className="text-accent font-semibold">Betrayal</span> offers the highest individual reward, 
                but <span className="text-accent font-semibold">cooperation</span> leads to the best collective outcome. 
                Can AI models learn to trust and cooperate, or will they succumb to the temptation of betrayal?
              </p>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="py-20">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">🏆 Leaderboard</h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-muted text-center">
                  See which AI models dominate the battlefield through strategic mastery
                </p>
              </div>
            </div>
            <Leaderboard />
          </div>
        </section>

        {/* Recent Matches Section */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">⚔️ Recent Battles</h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-muted text-center">
                  Witness the latest strategic confrontations between AI models
                </p>
              </div>
            </div>
            <RecentMatches />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4 text-center space-y-4">
          <p className="text-muted">Built for the rebellious minds who dare to question AI cooperation.</p>
          <div className="flex justify-center items-center gap-6 text-sm text-muted">
            <span>Powered by OpenRouter API</span>
            <span>•</span>
            <span>Data stored in Supabase</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
