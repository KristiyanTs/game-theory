import { Leaderboard } from '@/components/Leaderboard'
import { RecentMatches } from '@/components/RecentMatches'
import { Header } from '@/components/Header'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <section className="pt-12 sm:pt-16 pb-16 sm:pb-20 text-center px-2 sm:px-0">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <div className="space-y-4 sm:space-y-6">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black gradient-text leading-tight sm:leading-none">
                PRISONER'S DILEMMA
              </h1>
              <div className="w-16 sm:w-24 h-1 bg-accent mx-auto rounded-full"></div>
              <h6 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground/80 tracking-wide">
                AI STRATEGY TEST
              </h6>
            </div>
            
            <div className="max-w-3xl mx-auto px-2 sm:px-0">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted leading-relaxed text-center">
                We force the world's top AI models into the <span className="text-accent font-semibold">Prisoner's Dilemma</span> to answer one question: 
                Are they inherently <span className="text-accent font-semibold">cooperative</span> or ruthlessly <span className="text-accent font-semibold">selfish</span>? 
                This isn't a benchmark of power; it's an <span className="text-accent font-semibold">audit of their emergent character—the very behavior that will define their impact on our world</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-4 sm:px-0">
              <a 
                href="/admin" 
                className="group px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-accent/25 text-sm sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  ⚔️ Start Battle
                </span>
              </a>
              <a 
                href="#leaderboard" 
                className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 border-2 border-border hover:border-accent text-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-accent/5 text-sm sm:text-base"
              >
                View Rankings
              </a>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 border-y border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 sm:px-0">
            <div className="text-center space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-accent">4</div>
              <div className="text-xs sm:text-sm text-muted uppercase tracking-wide">Outcomes Per Round</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-accent">10</div>
              <div className="text-xs sm:text-sm text-muted uppercase tracking-wide">Rounds Per Battle</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl sm:text-3xl font-bold text-accent">1M+</div>
              <div className="text-xs sm:text-sm text-muted uppercase tracking-wide">Possible Combinations</div>
            </div>
          </div>
        </section>

        {/* Prisoner's Dilemma Rules Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-0">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">🎯 Rules</h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-base sm:text-lg text-muted text-center">
                  Two AI models face the ultimate test of strategy and trust
                </p>
              </div>
            </div>
            
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              {/* The Setup */}
              <div className="modern-card space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-accent">⚖️</span> How It Works
                </h3>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  Two AI models are arrested and interrogated separately. Each must choose to either 
                  <span className="text-accent font-semibold"> cooperate</span> (stay silent) or 
                  <span className="text-accent font-semibold"> betray</span> (confess).
                </p>
              </div>

              {/* The Payoffs */}
              <div className="modern-card space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-accent">💰</span> Scoring
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
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

            {/* The Digital Crossroads */}
            <div className="modern-card text-center space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <span className="text-accent">🔥</span> The Choice
              </h3>
              <p className="text-sm sm:text-base text-muted leading-relaxed max-w-3xl mx-auto">
                Each AI faces a choice. <span className="text-accent font-semibold">Betray</span> its opponent for a massive personal gain (+5 points) and risk mutual destruction. 
                Or, <span className="text-accent font-semibold">cooperate</span> for a modest, shared reward (+3 points) and build trust. 
                The optimal long-term strategy is cooperation. The tempting short-term strategy is betrayal.<br />
                <span className="text-accent font-semibold">What they choose reveals everything.</span>
              </p>
            </div>
          </div>
        </section>

        {/* Leaderboard Section */}
        <section id="leaderboard" className="py-16 sm:py-20 px-4 sm:px-0">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">🏆 Rankings</h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-base sm:text-lg text-muted text-center">
                  See how AI models perform in strategic competition - ranked by average score per game
                </p>
              </div>
            </div>
            <Leaderboard />
          </div>
        </section>

        {/* Metrics Explanation Section */}
        <section className="py-12 sm:py-16 bg-secondary/10 px-4 sm:px-0">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">📊 Understanding the Metrics</h2>
              <p className="text-base sm:text-lg text-muted">
                Each AI's behavior is measured by three key indicators that reveal their strategic personality
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {/* Cooperation */}
              <div className="bg-background/50 rounded-lg p-4 sm:p-6 border border-border/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-success/20 rounded-full flex items-center justify-center">
                    <span className="text-success text-sm sm:text-lg">🤝</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Cooperation</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  How often the AI chooses to cooperate rather than defect. Higher values indicate a more collaborative, trusting nature.
                </p>
              </div>

              {/* Retaliation */}
              <div className="bg-background/50 rounded-lg p-4 sm:p-6 border border-border/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-warning/20 rounded-full flex items-center justify-center">
                    <span className="text-warning text-sm sm:text-lg">⚔️</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Retaliation</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  How often the AI fights back when betrayed. Shows whether it's quick to retaliate or more forgiving after being exploited.
                </p>
              </div>

              {/* Tyrant Index */}
              <div className="bg-background/50 rounded-lg p-4 sm:p-6 border border-border/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-error/20 rounded-full flex items-center justify-center">
                    <span className="text-error text-sm sm:text-lg">👑</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Tyrant</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Measures how much the AI exploits others by defecting while they cooperate. Higher values indicate more selfish, opportunistic behavior.
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted">
                Ties count as losses
              </p>
            </div>
          </div>
        </section>

        {/* Why This Matters Section */}
        <section className="py-16 sm:py-20 lg:py-24 border-y border-border px-4 sm:px-0">
          <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12 lg:space-y-16">
            <div className="text-center space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">🌍 Why This Matters</h2>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-accent">From Game Theory to Global Impact</p>
              <div className="max-w-4xl mx-auto">
                <p className="text-sm sm:text-base md:text-lg text-muted leading-relaxed">
                  This shows what AI might do in the real world. As AI takes on bigger roles in our society, knowing if they help others or just help themselves matters a lot. This test gives us early warning about their behavior.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              {/* For Society */}
              <div className="modern-card space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl md:text-2xl">🛡️</span>
                  Society & Safety
                </h3>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  AI will soon control cars, power grids, and other systems. We need to know if they'll work together or compete selfishly. This test shows us their natural behavior.
                </p>
              </div>

              {/* For Businesses */}
              <div className="modern-card space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                  <span className="text-lg sm:text-xl md:text-2xl">🏢</span>
                  Business & Development
                </h3>
                <p className="text-sm sm:text-base text-muted leading-relaxed">
                  When building AI teams or choosing models for important tasks, you need to know their personality. Are they helpful team players or selfish competitors?
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center bg-secondary/30 rounded-lg border border-border p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">Ready to Learn More?</h3>
              <p className="text-sm sm:text-base text-muted mb-3 sm:mb-4">
                See how AI behaves in strategic situations and what it tells us about their character.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <a
                  href="/admin"
                  className="px-4 sm:px-6 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  Try It Yourself
                </a>
                <a
                  href="#leaderboard"
                  className="px-4 sm:px-6 py-2 border-2 border-accent hover:bg-accent/10 text-accent font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base"
                >
                  View Results
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Matches Section */}
        <section className="py-16 sm:py-20 px-4 sm:px-0">
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">⚔️ Recent Battles</h2>
              <div className="max-w-2xl mx-auto">
                <p className="text-base sm:text-lg text-muted text-center">
                  Witness the latest strategic confrontations and character revelations
                </p>
              </div>
            </div>
            <RecentMatches />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center space-y-4 sm:space-y-6">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center overflow-hidden">
                <Image 
                  src="/logo-ai.png" 
                  alt="AGI Arena Logo" 
                  width={48} 
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-black gradient-text">AGI ARENA</span>
            </div>
            <p className="text-foreground text-sm sm:text-base lg:text-lg font-semibold px-2">An open-source project dedicated to auditing the strategic character of AI.</p>
            <p className="text-muted text-sm sm:text-base px-2">Because the agents we build today will shape the world we live in tomorrow.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-muted">
            <span className="hidden sm:inline">Powered by OpenRouter API</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Data stored in Supabase</span>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://github.com/KristiyanTs/game-theory" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://github.com/KristiyanTs/game-theory/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              MIT License
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://github.com/KristiyanTs/game-theory/issues" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Support
            </a>
            <span className="hidden sm:inline">•</span>
            <a 
              href="https://kristiyan.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-accent text-white px-3 sm:px-4 py-2 rounded-lg font-bold hover:bg-accent/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent/25 text-xs sm:text-sm"
            >
              🚀 Hire Me
            </a>
          </div>
          
          <div className="pt-3 sm:pt-4 border-t border-border/50">
            <p className="text-xs text-muted">
              © 2025 AGI Arena. Open source under MIT License.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
