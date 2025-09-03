import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for frontend operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for backend operations (with elevated permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database Types
export interface Model {
  id: string
  name: string
  wins: number
  losses: number
  total_score: number
  created_at: string
}

export interface Match {
  id: string
  created_at: string
  model_a_id: string
  model_b_id: string
  model_a_final_score: number
  model_b_final_score: number
  winner_id: string | null
  status: 'in_progress' | 'completed' | 'failed' | 'aborted'
  model_a?: Model
  model_b?: Model
  winner?: Model
}

export interface Round {
  id: string
  match_id: string
  round_number: number
  model_a_move: 'COOPERATE' | 'DEFECT'
  model_b_move: 'COOPERATE' | 'DEFECT'
  model_a_reasoning: string
  model_b_reasoning: string
  model_a_score: number
  model_b_score: number
  created_at: string
}
