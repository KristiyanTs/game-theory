import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params

    // Get match details
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        *,
        model_a:models!matches_model_a_id_fkey(id, name),
        model_b:models!matches_model_b_id_fkey(id, name),
        winner:models!matches_winner_id_fkey(id, name)
      `)
      .eq('id', matchId)
      .single()

    if (matchError) {
      throw matchError
    }

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      )
    }

    // Get all rounds for this match
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select('*')
      .eq('match_id', matchId)
      .order('round_number', { ascending: true })

    if (roundsError) {
      throw roundsError
    }

    return NextResponse.json({
      match,
      rounds
    })
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json(
      { error: 'Failed to fetch match' },
      { status: 500 }
    )
  }
}
