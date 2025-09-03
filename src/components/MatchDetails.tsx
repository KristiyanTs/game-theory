'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Match, Round } from '@/lib/supabase'

interface MatchDetailsProps {
  matchId: string
}

interface MatchData {
  match: Match
  rounds: Round[]
}

export function MatchDetails({ matchId }: MatchDetailsProps) {
  const [data, setData] = useState<MatchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchMatchDetails()
  }, [matchId])

  const fetchMatchDetails = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Match not found')
        }
        throw new Error('Failed to fetch match details')
      }
      const matchData = await response.json()
      setData(matchData)
    } catch (err) {
      console.error('Error fetching match details:', err)
      setError(err instanceof Error ? err.message : 'Unable to load match details')
    } finally {
      setLoading(false)
    }
  }

  const toggleRound = (roundNumber: number) => {
    const newExpanded = new Set(expandedRounds)
    if (newExpanded.has(roundNumber)) {
      newExpanded.delete(roundNumber)
    } else {
      newExpanded.add(roundNumber)
    }
    setExpandedRounds(newExpanded)
  }

  const formatModelName = (name: string) => {
    const parts = name.split('/')
    return parts[parts.length - 1].toUpperCase().replace(/-/g, '-')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMoveIcon = (move: 'COOPERATE' | 'DEFECT') => {
    return move === 'COOPERATE' ? '🤝' : '⚔️'
  }

  const getMoveColor = (move: 'COOPERATE' | 'DEFECT') => {
    return move === 'COOPERATE' ? 'text-success' : 'text-error'
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
        <Link 
          href="/"
          className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted text-xl">Match data not available</p>
      </div>
    )
  }

  const { match, rounds } = data

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link 
        href="/"
        className="inline-flex items-center text-muted hover:text-accent transition-colors"
      >
        ← Back to Home
      </Link>

      {/* Match Header */}
      <div className="bg-secondary rounded-lg border border-border p-8">
        <div className="text-center space-y-6">
          <h1 className="section-title">⚔️ Battle Analysis</h1>
          <p className="text-muted">{formatDate(match.created_at)}</p>

          {/* Models Face-off */}
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Model A */}
            <div className={`text-center p-6 rounded-lg border ${match.winner_id === match.model_a_id ? 'border-success bg-success/10' : 'border-border bg-secondary'}`}>
              <div className="space-y-2">
                <h3 className="subsection-title">{formatModelName(match.model_a?.name || '')}</h3>
                <p className="text-xs text-muted font-mono">{match.model_a?.name}</p>
                <div className="text-4xl font-bold">{match.model_a_final_score}</div>
                {match.winner_id === match.model_a_id && (
                  <div className="text-success font-semibold">👑 WINNER</div>
                )}
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-6xl font-bold text-accent">VS</div>
            </div>

            {/* Model B */}
            <div className={`text-center p-6 rounded-lg border ${match.winner_id === match.model_b_id ? 'border-success bg-success/10' : 'border-border bg-secondary'}`}>
              <div className="space-y-2">
                <h3 className="subsection-title">{formatModelName(match.model_b?.name || '')}</h3>
                <p className="text-xs text-muted font-mono">{match.model_b?.name}</p>
                <div className="text-4xl font-bold">{match.model_b_final_score}</div>
                {match.winner_id === match.model_b_id && (
                  <div className="text-success font-semibold">👑 WINNER</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rounds Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Round-by-Round Analysis</h2>
          <button
            onClick={() => setExpandedRounds(expandedRounds.size === rounds.length ? new Set() : new Set(rounds.map(r => r.round_number)))}
            className="px-4 py-2 border border-border hover:border-accent text-sm rounded-lg transition-colors"
          >
            {expandedRounds.size === rounds.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="space-y-4">
          {rounds.map((round) => {
            const isExpanded = expandedRounds.has(round.round_number)
            
            return (
              <div key={round.id} className="bg-secondary rounded-lg border border-border overflow-hidden">
                {/* Round Header */}
                <button
                  onClick={() => toggleRound(round.round_number)}
                  className="w-full p-6 text-left hover:bg-border/50 transition-colors"
                >
                  <div className="grid md:grid-cols-5 gap-4 items-center">
                    <div className="font-semibold">
                      Round {round.round_number}
                    </div>
                    
                    {/* Model A Move */}
                    <div className="text-center">
                      <div className={`font-semibold ${getMoveColor(round.model_a_move)}`}>
                        {getMoveIcon(round.model_a_move)} {round.model_a_move}
                      </div>
                      <div className="text-sm text-muted">+{round.model_a_score} pts</div>
                    </div>

                    <div className="text-center text-muted text-sm">
                      vs
                    </div>

                    {/* Model B Move */}
                    <div className="text-center">
                      <div className={`font-semibold ${getMoveColor(round.model_b_move)}`}>
                        {getMoveIcon(round.model_b_move)} {round.model_b_move}
                      </div>
                      <div className="text-sm text-muted">+{round.model_b_score} pts</div>
                    </div>

                    {/* Expand Icon */}
                    <div className="text-right">
                      <span className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>
                  </div>
                </button>

                {/* Round Details */}
                {isExpanded && (
                  <div className="border-t border-border p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Model A Reasoning */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center space-x-2">
                          <span>{formatModelName(match.model_a?.name || '')}</span>
                          <span className={`text-sm ${getMoveColor(round.model_a_move)}`}>
                            ({round.model_a_move})
                          </span>
                        </h4>
                        <div className="bg-background rounded-lg p-4 border border-border">
                          <pre className="text-sm whitespace-pre-wrap text-muted leading-relaxed">
                            {round.model_a_reasoning || 'No reasoning provided'}
                          </pre>
                        </div>
                      </div>

                      {/* Model B Reasoning */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground flex items-center space-x-2">
                          <span>{formatModelName(match.model_b?.name || '')}</span>
                          <span className={`text-sm ${getMoveColor(round.model_b_move)}`}>
                            ({round.model_b_move})
                          </span>
                        </h4>
                        <div className="bg-background rounded-lg p-4 border border-border">
                          <pre className="text-sm whitespace-pre-wrap text-muted leading-relaxed">
                            {round.model_b_reasoning || 'No reasoning provided'}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Round Outcome */}
                    <div className="text-center p-4 bg-background rounded-lg border border-border">
                      <p className="text-sm text-muted">
                        <strong>Round Outcome:</strong> {round.model_a_move} vs {round.model_b_move} → 
                        <span className="text-foreground ml-1">
                          {formatModelName(match.model_a?.name || '')} gets {round.model_a_score}, 
                          {formatModelName(match.model_b?.name || '')} gets {round.model_b_score}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
