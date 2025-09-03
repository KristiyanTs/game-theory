'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-border bg-secondary/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚔</span>
            </div>
            <span className="text-2xl font-bold gradient-text">AI WAR ZONE</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/#leaderboard" 
              className="text-foreground hover:text-accent transition-colors"
            >
              Leaderboard
            </Link>
            <Link 
              href="/matches" 
              className="text-foreground hover:text-accent transition-colors"
            >
              All Matches
            </Link>
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              Admin
            </Link>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors text-sm"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
