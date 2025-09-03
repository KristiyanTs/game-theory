import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select(`
        *,
        model_a:models!matches_model_a_id_fkey(id, name),
        model_b:models!matches_model_b_id_fkey(id, name),
        winner:models!matches_winner_id_fkey(id, name)
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      throw error
    }

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
