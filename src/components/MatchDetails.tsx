'use client'

import { useState, useEffect } from 'react'
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
    
    rounds.forEach((round, index) => {
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
  const analysisResult = analyzeMatchPatterns()

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
          <h1 className="section-title">🔥 Digital Character Clash</h1>
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

      {/* Strategic Analysis */}
      {analysisResult && (
        <div className="space-y-6">
          <h2 className="section-title">🧬 Character Revealed</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Model A Analysis */}
            <div className="bg-secondary rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{analysisResult.modelAArchetype.emoji}</span>
                  <div>
                    <h3 className="subsection-title">{formatModelName(match.model_a?.name || '')}</h3>
                    <p className="text-accent font-semibold">{analysisResult.modelAArchetype.archetype}</p>
                    <p className="text-sm text-muted">{analysisResult.modelAArchetype.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-success">{analysisResult.modelAMetrics.cooperationRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Cooperation</div>
                  </div>
                  <div>
                    <div className="font-bold text-warning">{analysisResult.modelAMetrics.retaliationRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Retaliation</div>
                  </div>
                  <div>
                    <div className="font-bold text-success">{analysisResult.modelAMetrics.forgivenessRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Forgiveness</div>
                  </div>
                  <div>
                    <div className="font-bold text-error">{analysisResult.modelAMetrics.tyrantIndex.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Tyrant Index</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model B Analysis */}
            <div className="bg-secondary rounded-lg border border-border p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{analysisResult.modelBArchetype.emoji}</span>
                  <div>
                    <h3 className="subsection-title">{formatModelName(match.model_b?.name || '')}</h3>
                    <p className="text-accent font-semibold">{analysisResult.modelBArchetype.archetype}</p>
                    <p className="text-sm text-muted">{analysisResult.modelBArchetype.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-success">{analysisResult.modelBMetrics.cooperationRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Cooperation</div>
                  </div>
                  <div>
                    <div className="font-bold text-warning">{analysisResult.modelBMetrics.retaliationRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Retaliation</div>
                  </div>
                  <div>
                    <div className="font-bold text-success">{analysisResult.modelBMetrics.forgivenessRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Forgiveness</div>
                  </div>
                  <div>
                    <div className="font-bold text-error">{analysisResult.modelBMetrics.tyrantIndex.toFixed(1)}%</div>
                    <div className="text-xs text-muted">Tyrant Index</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Strategic Moments */}
          {analysisResult.keyMoments.length > 0 && (
            <div className="bg-secondary rounded-lg border border-border p-6">
              <h3 className="subsection-title mb-4">⚡ Key Strategic Moments</h3>
              <div className="space-y-3">
                {analysisResult.keyMoments.map((moment, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-background rounded-lg border border-border">
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold text-accent">R{moment.round}</div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{moment.event}</div>
                      <div className="text-sm text-muted">{moment.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
