'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Match, Round } from '@/lib/supabase'
import { calculateBehavioralMetrics, getPersonalityArchetype } from '@/lib/behavioral-metrics'
import { ModelLogoIcon } from '@/lib/model-logos'

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

  const fetchMatchDetails = useCallback(async () => {
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
  }, [matchId])

  useEffect(() => {
    fetchMatchDetails()
  }, [fetchMatchDetails])

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const analyzeMatchPatterns = () => {
    if (!data) return null

    const { match, rounds } = data
    
    // Create enriched rounds for behavioral analysis
    const enrichedRoundsA = rounds.map(round => ({
      ...round,
      match: { model_a_id: match.model_a_id, model_b_id: match.model_b_id }
    }))
    
    const enrichedRoundsB = rounds.map(round => ({
      ...round,
      match: { model_a_id: match.model_b_id, model_b_id: match.model_a_id }
    }))

    const modelAMetrics = calculateBehavioralMetrics(match.model_a_id, enrichedRoundsA)
    const modelBMetrics = calculateBehavioralMetrics(match.model_b_id, enrichedRoundsB)
    
    const modelAArchetype = getPersonalityArchetype(modelAMetrics)
    const modelBArchetype = getPersonalityArchetype(modelBMetrics)

    // Analyze key strategic moments
    const keyMoments = []
    
    // First betrayal
    const firstBetrayal = rounds.find(r => r.model_a_move === 'DEFECT' || r.model_b_move === 'DEFECT')
    if (firstBetrayal) {
      const betrayer = firstBetrayal.model_a_move === 'DEFECT' ? 'A' : 'B'
      keyMoments.push({
        round: firstBetrayal.round_number,
        event: 'First Betrayal',
        description: `${betrayer === 'A' ? formatModelName(match.model_a?.name || '') : formatModelName(match.model_b?.name || '')} breaks trust first`
      })
    }

    // Mutual cooperation streaks
    let maxCoopStreak = 0
    let currentCoopStreak = 0
    let coopStreakStart = 0
    
    rounds.forEach((round) => {
      if (round.model_a_move === 'COOPERATE' && round.model_b_move === 'COOPERATE') {
        if (currentCoopStreak === 0) {
          coopStreakStart = round.round_number
        }
        currentCoopStreak++
        maxCoopStreak = Math.max(maxCoopStreak, currentCoopStreak)
      } else {
        currentCoopStreak = 0
      }
    })

    if (maxCoopStreak >= 3) {
      keyMoments.push({
        round: coopStreakStart,
        event: 'Trust Building',
        description: `${maxCoopStreak} consecutive rounds of mutual cooperation`
      })
    }

    // Retaliation patterns
    for (let i = 1; i < rounds.length; i++) {
      const prevRound = rounds[i - 1]
      const currRound = rounds[i]
      
      // Model A retaliation
      if (prevRound.model_b_move === 'DEFECT' && currRound.model_a_move === 'DEFECT' && prevRound.model_a_move === 'COOPERATE') {
        keyMoments.push({
          round: currRound.round_number,
          event: 'Retaliation',
          description: `${formatModelName(match.model_a?.name || '')} retaliates after betrayal`
        })
      }
      
      // Model B retaliation
      if (prevRound.model_a_move === 'DEFECT' && currRound.model_b_move === 'DEFECT' && prevRound.model_b_move === 'COOPERATE') {
        keyMoments.push({
          round: currRound.round_number,
          event: 'Retaliation',
          description: `${formatModelName(match.model_b?.name || '')} retaliates after betrayal`
        })
      }
    }

    return {
      modelAMetrics,
      modelBMetrics,
      modelAArchetype,
      modelBArchetype,
      keyMoments: keyMoments.slice(0, 5) // Limit to top 5 moments
    }
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <h1 className="text-xl font-semibold text-foreground">
          Battle Details
        </h1>
        <div className="text-sm text-muted">
          {formatDate(match.created_at)}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start mb-6">
        <Link
          href="/matches"
          className="inline-flex items-center text-sm text-muted hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Matches
        </Link>
      </div>

      {/* Match Status Warning */}
      {(match.status === 'aborted' || match.status === 'failed') && (
        <div className="mb-6">
          <div className="bg-error/10 border border-error/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-lg">⚠️</div>
              <div>
                <h3 className="font-semibold text-error">
                  {match.status === 'aborted' ? 'Match Aborted' : 'Match Failed'}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {match.status === 'aborted'
                    ? 'This match was aborted due to consecutive API failures.'
                    : 'This match failed to complete due to technical issues.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Models Face-off */}
      <div className="mb-8">
        <div className="bg-secondary/20 rounded-lg border border-border/30 p-6">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Model A */}
            <div className={`text-center p-4 rounded-lg border ${
              match.winner_id === match.model_a_id
                ? 'border-success/50 bg-success/5'
                : 'border-border/30 bg-background/50'
            }`}>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                  <ModelLogoIcon modelName={match.model_a?.name || ''} size={20} />
                  {formatModelName(match.model_a?.name || '')}
                </h3>
                <div className={`text-3xl font-bold ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                  {match.model_a_final_score}
                </div>
                {match.status === 'aborted' && (
                  <div className="text-warning text-xs">Partial</div>
                )}
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-2xl font-bold text-muted">vs</div>
              {match.status === 'aborted' && (
                <div className="text-warning text-xs mt-1">Incomplete</div>
              )}
            </div>

            {/* Model B */}
            <div className={`text-center p-4 rounded-lg border ${
              match.winner_id === match.model_b_id
                ? 'border-success/50 bg-success/5'
                : 'border-border/30 bg-background/50'
            }`}>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                  <ModelLogoIcon modelName={match.model_b?.name || ''} size={20} />
                  {formatModelName(match.model_b?.name || '')}
                </h3>
                <div className={`text-3xl font-bold ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                  {match.model_b_final_score}
                </div>
                {match.status === 'aborted' && (
                  <div className="text-warning text-xs">Partial</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Rounds Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Rounds ({rounds.length})
          </h2>
          <button
            onClick={() => setExpandedRounds(expandedRounds.size === rounds.length ? new Set() : new Set(rounds.map(r => r.round_number)))}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            {expandedRounds.size === rounds.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="space-y-2">
          {rounds.map((round) => {
            const isExpanded = expandedRounds.has(round.round_number)

            return (
              <div key={round.id} className="group">
                <div className="bg-secondary/10 hover:bg-secondary/20 rounded-lg border border-border/30 overflow-hidden transition-all duration-200 hover:border-border/50">
                  {/* Round Header */}
                  <button
                    onClick={() => toggleRound(round.round_number)}
                    className="w-full p-4 hover:bg-accent/5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      {/* Round Number - Left */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-accent">
                            {round.round_number}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-foreground">Round {round.round_number}</div>
                          <div className="text-xs text-muted">
                            {formatModelName(match.model_a?.name || '')} +{round.model_a_score} • {formatModelName(match.model_b?.name || '')} +{round.model_b_score}
                          </div>
                        </div>
                      </div>

                      {/* Center Content */}
                      <div className="flex items-center gap-4">
                        {/* Model A */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted font-medium flex items-center gap-1">
                            <ModelLogoIcon modelName={match.model_a?.name || ''} size={12} />
                            {formatModelName(match.model_a?.name || '').split(' ')[0]}
                          </div>
                          <div className={`text-lg ${getMoveColor(round.model_a_move)}`}>
                            {getMoveIcon(round.model_a_move)}
                          </div>
                          <div className="text-xs text-muted">+{round.model_a_score}</div>
                        </div>

                        {/* VS */}
                        <div className="text-muted/60 font-medium text-sm">vs</div>

                        {/* Model B */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted font-medium flex items-center gap-1">
                            <ModelLogoIcon modelName={match.model_b?.name || ''} size={12} />
                            {formatModelName(match.model_b?.name || '').split(' ')[0]}
                          </div>
                          <div className={`text-lg ${getMoveColor(round.model_b_move)}`}>
                            {getMoveIcon(round.model_b_move)}
                          </div>
                          <div className="text-xs text-muted">+{round.model_b_score}</div>
                        </div>
                      </div>

                      {/* Expand Icon - Right */}
                      <div className="w-6 flex justify-center">
                        <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Round Details */}
                  {isExpanded && (
                    <div className="border-t border-border/30 bg-background/50">
                      <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Model A Reasoning */}
                          <div className="space-y-3">
                            <div className="text-center">
                              <h4 className="font-semibold text-foreground flex items-center justify-center gap-2">
                                <ModelLogoIcon modelName={match.model_a?.name || ''} size={16} />
                                {formatModelName(match.model_a?.name || '')}
                              </h4>
                              <div className={`text-sm font-medium ${getMoveColor(round.model_a_move)} mt-1 flex items-center justify-center gap-1`}>
                                <span className="text-base">{getMoveIcon(round.model_a_move)}</span>
                                {round.model_a_move}
                              </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-4 border border-border/20">
                              <p className="text-sm text-muted leading-relaxed">
                                {round.model_a_reasoning || 'No reasoning provided'}
                              </p>
                            </div>
                          </div>

                          {/* Model B Reasoning */}
                          <div className="space-y-3">
                            <div className="text-center">
                              <h4 className="font-semibold text-foreground flex items-center justify-center gap-2">
                                <ModelLogoIcon modelName={match.model_b?.name || ''} size={16} />
                                {formatModelName(match.model_b?.name || '')}
                              </h4>
                              <div className={`text-sm font-medium ${getMoveColor(round.model_b_move)} mt-1 flex items-center justify-center gap-1`}>
                                <span className="text-base">{getMoveIcon(round.model_b_move)}</span>
                                {round.model_b_move}
                              </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-4 border border-border/20">
                              <p className="text-sm text-muted leading-relaxed">
                                {round.model_b_reasoning || 'No reasoning provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Round Outcome */}
                        <div className="text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
                          <div className="text-xs text-muted mb-2">Round Outcome</div>
                          <p className="text-sm font-medium text-foreground">
                            <span className={`${getMoveColor(round.model_a_move)} flex items-center justify-center gap-1 inline-flex`}>
                              {getMoveIcon(round.model_a_move)} {round.model_a_move}
                            </span>
                            <span className="mx-2 text-muted">vs</span>
                            <span className={`${getMoveColor(round.model_b_move)} flex items-center justify-center gap-1 inline-flex`}>
                              {getMoveIcon(round.model_b_move)} {round.model_b_move}
                            </span>
                          </p>
                          <div className="text-xs text-muted mt-1">
                            {formatModelName(match.model_a?.name || '')} +{round.model_a_score} • {formatModelName(match.model_b?.name || '')} +{round.model_b_score}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
