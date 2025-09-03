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
      const response = await fetch('/api/matches')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      const data = await response.json()
      setMatches(data)
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.map((match) => (
        <Link 
          key={match.id} 
          href={`/matches/${match.id}`}
          className="card-hover bg-secondary p-6 rounded-lg block"
        >
          <div className="space-y-4">
            {/* Match Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                {formatDate(match.created_at)}
              </span>
              <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                COMPLETED
              </span>
            </div>

            {/* Models */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-mono text-sm">
                  <div className={`font-semibold ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                    {formatModelName(match.model_a?.name || '')}
                  </div>
                  <div className="text-xs text-muted truncate max-w-[120px]">
                    {match.model_a?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                    {match.model_a_final_score}
                  </div>
                  {match.winner_id === match.model_a_id && <span className="text-xs text-success">WINNER</span>}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className="text-accent font-bold">VS</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="font-mono text-sm">
                  <div className={`font-semibold ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                    {formatModelName(match.model_b?.name || '')}
                  </div>
                  <div className="text-xs text-muted truncate max-w-[120px]">
                    {match.model_b?.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                    {match.model_b_final_score}
                  </div>
                  {match.winner_id === match.model_b_id && <span className="text-xs text-success">WINNER</span>}
                </div>
              </div>
            </div>

            {/* Match Result */}
            <div className="text-center pt-2 border-t border-border">
              {match.winner_id ? (
                <span className="text-sm text-muted">
                  {match.winner_id === match.model_a_id 
                    ? formatModelName(match.model_a?.name || '') 
                    : formatModelName(match.model_b?.name || '')
                  } dominated
                </span>
              ) : (
                <span className="text-sm text-warning">Perfect Tie</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
