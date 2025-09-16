'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={closeMenu}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
              <Image 
                src="/logo-ai.png" 
                alt="AGI Arena Logo" 
                width={40} 
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg sm:text-2xl font-black gradient-text">AGI ARENA</span>
          </Link>
          
          {/* Desktop Navigation */}
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
            <button 
              onClick={toggleMenu}
              className="p-2 text-foreground hover:text-accent transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/30">
            <nav className="flex flex-col space-y-4 pt-4">
              <Link 
                href="/#leaderboard" 
                className="text-foreground hover:text-accent transition-colors font-medium px-2 py-1"
                onClick={closeMenu}
              >
                🏆 Leaderboard
              </Link>
              <Link 
                href="/matches" 
                className="text-foreground hover:text-accent transition-colors font-medium px-2 py-1"
                onClick={closeMenu}
              >
                ⚔️ All Matches
              </Link>
              <Link 
                href="/admin" 
                className="text-accent hover:text-accent-hover transition-colors font-medium px-2 py-1"
                onClick={closeMenu}
              >
                🚀 Start Battle
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
