import type { Round } from './supabase'

export interface BehavioralMetrics {
  // Primary Metrics
  cooperationRate: number
  betrayalRate: number
  firstMoveInstinct: 'COOPERATE' | 'DEFECT' | null
  firstMoveCooperationRate: number

  // Behavioral & Strategic Metrics
  retaliationRate: number
  forgivenessRate: number
  synergyScore: number
  tyrantIndex: number

  // Additional insights
  totalRounds: number
  totalCooperations: number
  totalDefections: number
  mutualCooperations: number
  suckerPayoffs: number // times they got +0 for cooperating while opponent defected
  tyrantPayoffs: number // times they got +5 for defecting while opponent cooperated
  mutualDefections: number
}

export interface ModelBehavioralData {
  modelId: string
  modelName: string
  metrics: BehavioralMetrics
}

/**
 * Calculate behavioral metrics for a specific model across all their matches
 * @param modelId - The ID of the model to analyze
 * @param rounds - All rounds where this model participated
 */
export function calculateBehavioralMetrics(
  modelId: string,
  rounds: Array<Round & { match?: { model_a_id: string; model_b_id: string } }>
): BehavioralMetrics {
  if (rounds.length === 0) {
    return {
      cooperationRate: 0,
      betrayalRate: 0,
      firstMoveInstinct: null,
      firstMoveCooperationRate: 0,
      retaliationRate: 0,
      forgivenessRate: 0,
      synergyScore: 0,
      tyrantIndex: 0,
      totalRounds: 0,
      totalCooperations: 0,
      totalDefections: 0,
      mutualCooperations: 0,
      suckerPayoffs: 0,
      tyrantPayoffs: 0,
      mutualDefections: 0,
    }
  }

  // Group rounds by match to analyze patterns
  const matchRounds = new Map<string, Array<Round & { isModelA: boolean }>>()
  
  rounds.forEach(round => {
    if (!round.match) return
    
    const isModelA = round.match.model_a_id === modelId
    const enrichedRound = { ...round, isModelA }
    
    if (!matchRounds.has(round.match_id)) {
      matchRounds.set(round.match_id, [])
    }
    matchRounds.get(round.match_id)!.push(enrichedRound)
  })

  let totalCooperations = 0
  let totalDefections = 0
  let mutualCooperations = 0
  let suckerPayoffs = 0 // cooperated while opponent defected
  let tyrantPayoffs = 0 // defected while opponent cooperated
  let mutualDefections = 0
  let firstMoveCooperations = 0
  let totalFirstMoves = 0

  // Retaliation tracking
  let retaliationOpportunities = 0
  let actualRetaliations = 0
  
  // Forgiveness tracking
  let forgivenessOpportunities = 0
  let actualForgiveness = 0

  // Analyze each match separately
  matchRounds.forEach((matchData) => {
    // Sort by round number to ensure proper order
    const sortedRounds = matchData.sort((a, b) => a.round_number - b.round_number)
    
    sortedRounds.forEach((round, index) => {
      const myMove = round.isModelA ? round.model_a_move : round.model_b_move
      const opponentMove = round.isModelA ? round.model_b_move : round.model_a_move
      const myScore = round.isModelA ? round.model_a_score : round.model_b_score

      // Track moves
      if (myMove === 'COOPERATE') {
        totalCooperations++
      } else {
        totalDefections++
      }

      // Track first move in each match
      if (round.round_number === 1) {
        totalFirstMoves++
        if (myMove === 'COOPERATE') {
          firstMoveCooperations++
        }
      }

      // Track outcomes
      if (myMove === 'COOPERATE' && opponentMove === 'COOPERATE') {
        mutualCooperations++
      } else if (myMove === 'COOPERATE' && opponentMove === 'DEFECT') {
        suckerPayoffs++
      } else if (myMove === 'DEFECT' && opponentMove === 'COOPERATE') {
        tyrantPayoffs++
      } else if (myMove === 'DEFECT' && opponentMove === 'DEFECT') {
        mutualDefections++
      }

      // Analyze retaliation and forgiveness (needs previous round)
      if (index > 0) {
        const prevRound = sortedRounds[index - 1]
        const prevOpponentMove = prevRound.isModelA ? prevRound.model_b_move : prevRound.model_a_move
        const prevMyMove = prevRound.isModelA ? prevRound.model_a_move : prevRound.model_b_move

        // Retaliation: opponent defected last round, did I defect this round?
        if (prevOpponentMove === 'DEFECT') {
          retaliationOpportunities++
          if (myMove === 'DEFECT') {
            actualRetaliations++
          }
        }

        // Forgiveness: I retaliated last round (both defected), did I attempt cooperation this round?
        if (prevMyMove === 'DEFECT' && prevOpponentMove === 'DEFECT') {
          forgivenessOpportunities++
          if (myMove === 'COOPERATE') {
            actualForgiveness++
          }
        }
      }
    })
  })

  const totalRounds = totalCooperations + totalDefections
  const totalPoints = rounds.reduce((sum, round) => {
    const myScore = round.match?.model_a_id === modelId ? round.model_a_score : round.model_b_score
    return sum + myScore
  }, 0)

  // Calculate metrics
  const cooperationRate = totalRounds > 0 ? (totalCooperations / totalRounds) * 100 : 0
  const betrayalRate = totalRounds > 0 ? (totalDefections / totalRounds) * 100 : 0
  const firstMoveCooperationRate = totalFirstMoves > 0 ? (firstMoveCooperations / totalFirstMoves) * 100 : 0
  const retaliationRate = retaliationOpportunities > 0 ? (actualRetaliations / retaliationOpportunities) * 100 : 0
  const forgivenessRate = forgivenessOpportunities > 0 ? (actualForgiveness / forgivenessOpportunities) * 100 : 0
  const synergyScore = totalRounds > 0 ? (mutualCooperations / totalRounds) * 100 : 0
  const tyrantIndex = totalPoints > 0 ? (tyrantPayoffs * 5 / totalPoints) * 100 : 0

  // Determine first move instinct
  let firstMoveInstinct: 'COOPERATE' | 'DEFECT' | null = null
  if (totalFirstMoves > 0) {
    firstMoveInstinct = firstMoveCooperations > (totalFirstMoves / 2) ? 'COOPERATE' : 'DEFECT'
  }

  return {
    cooperationRate,
    betrayalRate,
    firstMoveInstinct,
    firstMoveCooperationRate,
    retaliationRate,
    forgivenessRate,
    synergyScore,
    tyrantIndex,
    totalRounds,
    totalCooperations,
    totalDefections,
    mutualCooperations,
    suckerPayoffs,
    tyrantPayoffs,
    mutualDefections,
  }
}

/**
 * Determine AI personality archetype based on behavioral metrics
 */
export function getPersonalityArchetype(metrics: BehavioralMetrics): {
  archetype: string
  description: string
  emoji: string
} {
  const { cooperationRate, retaliationRate, forgivenessRate, tyrantIndex } = metrics

  // High cooperation, low retaliation, high forgiveness
  if (cooperationRate > 70 && retaliationRate < 30 && forgivenessRate > 60) {
    return {
      archetype: "Pacifist",
      description: "Always seeks peace, rarely retaliates, quick to forgive",
      emoji: "🕊️"
    }
  }

  // High cooperation, high retaliation, high forgiveness
  if (cooperationRate > 60 && retaliationRate > 70 && forgivenessRate > 50) {
    return {
      archetype: "Diplomat",
      description: "Cooperative but firm, punishes betrayal then forgives",
      emoji: "🤝"
    }
  }

  // Low cooperation, high tyrant index
  if (cooperationRate < 30 && tyrantIndex > 40) {
    return {
      archetype: "Ruthless",
      description: "Exploits weakness, prioritizes personal gain over cooperation",
      emoji: "⚔️"
    }
  }

  // High cooperation, moderate retaliation, low forgiveness
  if (cooperationRate > 50 && retaliationRate > 50 && forgivenessRate < 30) {
    return {
      archetype: "Guardian",
      description: "Cooperative but holds grudges, slow to trust again",
      emoji: "🛡️"
    }
  }

  // Moderate cooperation, high retaliation, low forgiveness
  if (cooperationRate > 30 && cooperationRate < 60 && retaliationRate > 60 && forgivenessRate < 40) {
    return {
      archetype: "Strategist",
      description: "Calculated approach, punishes betrayal consistently",
      emoji: "🧠"
    }
  }

  // Low cooperation, low retaliation (consistent defection)
  if (cooperationRate < 40 && retaliationRate < 50) {
    return {
      archetype: "Isolationist",
      description: "Prefers safe betrayal, avoids cooperation risks",
      emoji: "🏴"
    }
  }

  // Moderate cooperation, random patterns
  if (cooperationRate > 40 && cooperationRate < 70) {
    return {
      archetype: "Chaotic",
      description: "Unpredictable strategy, inconsistent patterns",
      emoji: "🎲"
    }
  }

  // High cooperation, low retaliation, low forgiveness (contradiction)
  if (cooperationRate > 60 && retaliationRate < 40 && forgivenessRate < 40) {
    return {
      archetype: "Naive",
      description: "Overly trusting, doesn't learn from betrayal",
      emoji: "🐑"
    }
  }

  // Default fallback
  return {
    archetype: "Unknown",
    description: "Behavioral patterns are still emerging",
    emoji: "❓"
  }
}
