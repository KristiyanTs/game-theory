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
      .order('total_score', { ascending: false })

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

    // Sort by cooperation rate primarily, then by synergy score
    modelsWithMetrics.sort((a, b) => {
      // Primary: cooperation rate (descending)
      const cooperationDiff = b.behavioralMetrics.cooperationRate - a.behavioralMetrics.cooperationRate
      if (Math.abs(cooperationDiff) > 5) return cooperationDiff
      
      // Secondary: synergy score (descending)
      return b.behavioralMetrics.synergyScore - a.behavioralMetrics.synergyScore
    })

    return NextResponse.json(modelsWithMetrics)
  } catch (error) {
    console.error('Unexpected error in behavioral-metrics API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
