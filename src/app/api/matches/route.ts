import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    if (countError) {
      throw countError
    }

    // Get matches with pagination
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
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    const totalPages = Math.ceil((totalCount || 0) / limit)

    return NextResponse.json({
      matches,
      totalPages,
      total: totalCount || 0,
      currentPage: page,
      limit
    })
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
