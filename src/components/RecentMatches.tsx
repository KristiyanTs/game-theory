'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/supabase'

export function RecentMatches() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches?limit=20')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      const data = await response.json()
      setMatches(data.matches || data) // Handle both old and new API response formats
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Unable to load recent matches')
    } finally {
      setLoading(false)
    }
  }

  const formatModelName = (name: string) => {
    const parts = name.split('/')
    return parts[parts.length - 1].toUpperCase().replace(/-/g, '-')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error text-lg">{error}</p>
        <button 
          onClick={fetchMatches}
          className="mt-4 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">No matches have been completed yet.</p>
        <p className="text-sm text-muted mt-2">Run your first match to see the battle history!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 max-w-2xl mx-auto">
        {matches.slice(0, 10).map((match) => (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className="block group hover:bg-secondary/50 transition-colors duration-200 py-3 px-4 rounded-lg mx-auto max-w-lg"
          >
            <div className="flex items-center justify-between text-sm">
              {/* Date */}
              <div className="text-muted w-20 flex-shrink-0">
                {formatDate(match.created_at)}
              </div>

              {/* Models */}
              <div className="flex items-center space-x-6 flex-1 justify-center">
                <div className="text-center">
                  <div className={`font-mono font-semibold flex items-center justify-center gap-1 ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                    {match.winner_id === match.model_a_id && <span>🏆</span>}
                    {formatModelName(match.model_a?.name || '')}
                  </div>
                  <div className={`text-lg font-bold ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                    {match.model_a_final_score}
                  </div>
                </div>

                <div className="text-accent font-bold text-xs">VS</div>

                <div className="text-center">
                  <div className={`font-mono font-semibold flex items-center justify-center gap-1 ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                    {match.winner_id === match.model_b_id && <span>🏆</span>}
                    {formatModelName(match.model_b?.name || '')}
                  </div>
                  <div className={`text-lg font-bold ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                    {match.model_b_final_score}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {matches.length > 10 && (
        <div className="text-center pt-4">
          <Link
            href="/battles"
            className="inline-flex items-center px-4 py-2 text-accent hover:text-accent-hover text-sm font-medium rounded-md transition-colors duration-200 hover:bg-accent/5"
          >
            Show More Battles
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
