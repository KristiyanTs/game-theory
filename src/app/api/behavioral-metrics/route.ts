import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateBehavioralMetrics, getPersonalityArchetype } from '@/lib/behavioral-metrics'
import type { Model, Round } from '@/lib/supabase'

interface ModelWithMetrics extends Model {
  behavioralMetrics: ReturnType<typeof calculateBehavioralMetrics>
  personalityArchetype: ReturnType<typeof getPersonalityArchetype>
}

export async function GET() {
  try {
    // Fetch all models
    const { data: models, error: modelsError } = await supabaseAdmin
      .from('models')
      .select('*')

    if (modelsError) {
      console.error('Error fetching models:', modelsError)
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
    }

    if (!models || models.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all rounds with match data
    const { data: rounds, error: roundsError } = await supabaseAdmin
      .from('rounds')
      .select(`
        *,
        match:matches!inner (
          model_a_id,
          model_b_id,
          status
        )
      `)
      .eq('match.status', 'completed')

    if (roundsError) {
      console.error('Error fetching rounds:', roundsError)
      return NextResponse.json({ error: 'Failed to fetch rounds' }, { status: 500 })
    }

    // Calculate behavioral metrics for each model
    const modelsWithMetrics: ModelWithMetrics[] = models.map(model => {
      // Filter rounds where this model participated
      const modelRounds = (rounds || []).filter(round => 
        round.match && (
          round.match.model_a_id === model.id || 
          round.match.model_b_id === model.id
        )
      )

      const behavioralMetrics = calculateBehavioralMetrics(model.id, modelRounds)
      const personalityArchetype = getPersonalityArchetype(behavioralMetrics)

      return {
        ...model,
        behavioralMetrics,
        personalityArchetype
      }
    })

    // Sort by average score per game (descending)
    modelsWithMetrics.sort((a, b) => {
      const aGamesPlayed = a.wins + a.losses
      const bGamesPlayed = b.wins + b.losses
      
      const aAvgScore = aGamesPlayed > 0 ? a.total_score / aGamesPlayed : 0
      const bAvgScore = bGamesPlayed > 0 ? b.total_score / bGamesPlayed : 0
      
      console.log(`Sorting: ${a.name} avg=${aAvgScore.toFixed(1)} vs ${b.name} avg=${bAvgScore.toFixed(1)}`)
      
      return bAvgScore - aAvgScore
    })

    const response = NextResponse.json(modelsWithMetrics)
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    return response
  } catch (error) {
    console.error('Unexpected error in behavioral-metrics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
