'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xl">⚔</span>
            </div>
            <span className="text-2xl font-black gradient-text">AI WAR ZONE</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/#leaderboard" 
              className="text-foreground hover:text-accent transition-colors font-medium relative group"
            >
              Leaderboard
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/matches" 
              className="text-foreground hover:text-accent transition-colors font-medium relative group"
            >
              All Matches
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 text-foreground hover:text-accent transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
