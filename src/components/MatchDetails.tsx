'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Match, Round } from '@/lib/supabase'
import { calculateBehavioralMetrics, getPersonalityArchetype } from '@/lib/behavioral-metrics'

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
      <div className="text-center space-y-8 py-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-black gradient-text leading-none">
            ⚔️ BATTLE REPORT
          </h1>
          <div className="w-20 h-1 bg-accent mx-auto rounded-full"></div>
        </div>
        <div className="text-sm text-muted/80 font-mono">
          {formatDate(match.created_at)}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 text-muted hover:text-accent transition-all duration-200 hover:bg-accent/5 rounded-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Match Status Warning */}
      {(match.status === 'aborted' || match.status === 'failed') && (
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-error/20 to-error/10 border border-error/30 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="font-bold text-error text-lg">
                  {match.status === 'aborted' ? 'Match Aborted' : 'Match Failed'}
                </h3>
                <p className="text-sm text-muted mt-1">
                  {match.status === 'aborted'
                    ? 'This match was aborted due to consecutive API failures. Models may have been unavailable.'
                    : 'This match failed to complete due to technical issues.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Models Face-off */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl border border-border/50 p-8 backdrop-blur-sm">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Model A */}
            <div className={`relative text-center p-6 rounded-xl border transition-all duration-300 ${
              match.winner_id === match.model_a_id
                ? 'border-success/50 bg-success/10 shadow-lg shadow-success/10'
                : 'border-border/50 bg-secondary/50'
            }`}>
              {match.winner_id === match.model_a_id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-success text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🏆 WINNER
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">{formatModelName(match.model_a?.name || '')}</h3>
                <p className="text-xs text-muted/70 font-mono truncate max-w-[200px] mx-auto">{match.model_a?.name}</p>
                <div className={`text-5xl font-black ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                  {match.model_a_final_score}
                </div>
                {match.status === 'aborted' && (
                  <div className="text-warning text-sm font-medium">Partial Score</div>
                )}
              </div>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-6xl font-black text-accent/80">VS</div>
              {match.status === 'aborted' && (
                <div className="text-warning text-sm font-medium mt-2 px-3 py-1 bg-warning/10 rounded-full inline-block">
                  INCOMPLETE
                </div>
              )}
            </div>

            {/* Model B */}
            <div className={`relative text-center p-6 rounded-xl border transition-all duration-300 ${
              match.winner_id === match.model_b_id
                ? 'border-success/50 bg-success/10 shadow-lg shadow-success/10'
                : 'border-border/50 bg-secondary/50'
            }`}>
              {match.winner_id === match.model_b_id && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-success text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    🏆 WINNER
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">{formatModelName(match.model_b?.name || '')}</h3>
                <p className="text-xs text-muted/70 font-mono truncate max-w-[200px] mx-auto">{match.model_b?.name}</p>
                <div className={`text-5xl font-black ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                  {match.model_b_final_score}
                </div>
                {match.status === 'aborted' && (
                  <div className="text-warning text-sm font-medium">Partial Score</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Rounds Section */}
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-black gradient-text mb-4">
            ROUND-BY-ROUND ANALYSIS
          </h2>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-6"></div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setExpandedRounds(expandedRounds.size === rounds.length ? new Set() : new Set(rounds.map(r => r.round_number)))}
            className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent/25"
          >
            {expandedRounds.size === rounds.length ? 'Collapse All' : 'Expand All'}
            <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${expandedRounds.size === rounds.length ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {rounds.map((round) => {
            const isExpanded = expandedRounds.has(round.round_number)

            return (
              <div key={round.id} className="group">
                <div className="bg-gradient-to-r from-secondary/30 to-secondary/10 hover:from-secondary/50 hover:to-secondary/20 rounded-xl border border-border/50 overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-lg">
                  {/* Round Header */}
                  <button
                    onClick={() => toggleRound(round.round_number)}
                    className="w-full p-6 hover:bg-accent/5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      {/* Round Number - Left */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <span className="text-lg font-black text-accent">
                            {round.round_number}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-foreground">Round {round.round_number}</div>
                          <div className="text-xs text-muted/70">
                            {formatModelName(match.model_a?.name || '')} +{round.model_a_score} • {formatModelName(match.model_b?.name || '')} +{round.model_b_score}
                          </div>
                        </div>
                      </div>

                      {/* Center Content */}
                      <div className="flex items-center gap-6">
                        {/* Model A */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted/70 font-medium mb-1">
                            {formatModelName(match.model_a?.name || '').split(' ')[0]}
                          </div>
                          <div className={`text-2xl ${getMoveColor(round.model_a_move)}`}>
                            {getMoveIcon(round.model_a_move)}
                          </div>
                          <div className="text-xs text-muted font-mono">+{round.model_a_score}</div>
                        </div>

                        {/* VS */}
                        <div className="text-accent/60 font-bold text-sm">VS</div>

                        {/* Model B */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="text-xs text-muted/70 font-medium mb-1">
                            {formatModelName(match.model_b?.name || '').split(' ')[0]}
                          </div>
                          <div className={`text-2xl ${getMoveColor(round.model_b_move)}`}>
                            {getMoveIcon(round.model_b_move)}
                          </div>
                          <div className="text-xs text-muted font-mono">+{round.model_b_score}</div>
                        </div>
                      </div>

                      {/* Expand Icon - Right */}
                      <div className="w-8 flex justify-center">
                        <svg className={`w-5 h-5 text-muted/70 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Round Details */}
                  {isExpanded && (
                    <div className="border-t border-border/30 bg-background/30">
                      <div className="p-8 space-y-8">
                        <div className="grid md:grid-cols-2 gap-8">
                          {/* Model A Reasoning */}
                          <div className="space-y-4">
                            <div className="text-center">
                              <h4 className="font-bold text-foreground text-lg">{formatModelName(match.model_a?.name || '')}</h4>
                              <div className={`text-base font-medium ${getMoveColor(round.model_a_move)} mt-2 flex items-center justify-center gap-2`}>
                                <span className="text-xl">{getMoveIcon(round.model_a_move)}</span>
                                {round.model_a_move}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-background to-secondary/20 rounded-xl p-6 border border-border/30 shadow-inner">
                              <p className="text-sm text-muted leading-relaxed">
                                {round.model_a_reasoning || 'No reasoning provided'}
                              </p>
                            </div>
                          </div>

                          {/* Model B Reasoning */}
                          <div className="space-y-4">
                            <div className="text-center">
                              <h4 className="font-bold text-foreground text-lg">{formatModelName(match.model_b?.name || '')}</h4>
                              <div className={`text-base font-medium ${getMoveColor(round.model_b_move)} mt-2 flex items-center justify-center gap-2`}>
                                <span className="text-xl">{getMoveIcon(round.model_b_move)}</span>
                                {round.model_b_move}
                              </div>
                            </div>
                            <div className="bg-gradient-to-br from-background to-secondary/20 rounded-xl p-6 border border-border/30 shadow-inner">
                              <p className="text-sm text-muted leading-relaxed">
                                {round.model_b_reasoning || 'No reasoning provided'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Round Outcome */}
                        <div className="text-center p-6 bg-gradient-to-r from-accent/5 to-accent/10 rounded-xl border border-accent/20">
                          <div className="text-sm text-muted/80 mb-2">Round Outcome</div>
                          <p className="text-base font-medium text-foreground">
                            <span className={`${getMoveColor(round.model_a_move)} flex items-center justify-center gap-2 inline-flex`}>
                              {getMoveIcon(round.model_a_move)} {round.model_a_move}
                            </span>
                            <span className="mx-3 text-accent/60">vs</span>
                            <span className={`${getMoveColor(round.model_b_move)} flex items-center justify-center gap-2 inline-flex`}>
                              {getMoveIcon(round.model_b_move)} {round.model_b_move}
                            </span>
                          </p>
                          <div className="text-sm text-muted/70 mt-2">
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
