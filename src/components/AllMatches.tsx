'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/supabase'

export function AllMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches?limit=100')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      const data = await response.json()
      setMatches(data.matches || data) // Handle both old and new API response formats
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Unable to load matches')
    } finally {
      setLoading(false)
    }
  }

  const formatModelName = (name: string) => {
    const parts = name.split('/')
    return parts[parts.length - 1].toUpperCase().replace(/-/g, '-')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-error text-xl mb-4">{error}</p>
        <button 
          onClick={fetchMatches}
          className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="section-title">⚔️ All Battles</h1>
        <p className="text-muted">Complete history of AI warfare in the Prisoner's Dilemma arena</p>
      </div>

      {/* Back Button */}
      <Link 
        href="/"
        className="inline-flex items-center text-muted hover:text-accent transition-colors"
      >
        ← Back to Home
      </Link>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted text-xl">No battles have been fought yet.</p>
          <Link 
            href="/admin"
            className="inline-block mt-4 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            Start the First Battle
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {matches.map((match) => (
            <Link 
              key={match.id} 
              href={`/matches/${match.id}`}
              className="block py-3 px-4 hover:bg-secondary/30 border-b border-border/30 hover:border-accent/30 transition-all duration-200 group"
            >
              <div className="grid md:grid-cols-4 gap-4 items-center">
                {/* Date */}
                <div className="text-xs text-muted/70">
                  {formatDate(match.created_at)}
                </div>

                {/* Models */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-center space-x-6">
                    <div className="text-center">
                      <div className={`text-sm font-medium ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                        {formatModelName(match.model_a?.name || '')}
                      </div>
                      <div className="text-base font-semibold">{match.model_a_final_score}</div>
                    </div>
                    
                    <div className="text-muted/50 text-sm font-medium">vs</div>
                    
                    <div className="text-center">
                      <div className={`text-sm font-medium ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                        {formatModelName(match.model_b?.name || '')}
                      </div>
                      <div className="text-base font-semibold">{match.model_b_final_score}</div>
                    </div>
                  </div>
                </div>

                {/* Winner */}
                <div className="text-right">
                  {match.winner_id ? (
                    <div className="text-success text-sm font-medium">
                      {match.winner_id === match.model_a_id 
                        ? formatModelName(match.model_a?.name || '') 
                        : formatModelName(match.model_b?.name || '')
                      } won
                    </div>
                  ) : (
                    <div className="text-warning text-sm font-medium">Tie</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
