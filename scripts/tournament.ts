#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
const envPath = path.join(__dirname, '../.env.local')
config({ path: envPath })

// Verify environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Environment variables not loaded. Make sure .env.local exists and contains:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY') 
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('   OPENROUTER_API_KEY')
  process.exit(1)
}

import { supabaseAdmin } from '../src/lib/supabase'
import { GameEngine } from '../src/lib/game-engine'

// Tournament configuration
const TOURNAMENT_MODELS = [
  'anthropic/claude-sonnet-4',
  'openai/gpt-5', 
  'x-ai/grok-4',
  'google/gemini-2.5-pro'
]

const GAMES_PER_PAIR = 10

interface TournamentProgress {
  modelA: string
  modelB: string
  completed: number
  needed: number
}

class TournamentRunner {
  private gameEngine: GameEngine

  constructor() {
    this.gameEngine = new GameEngine()
  }

  /**
   * Get all model pairs that need to play games
   */
  private getAllModelPairs(): Array<{modelA: string, modelB: string}> {
    const pairs = []
    
    for (let i = 0; i < TOURNAMENT_MODELS.length; i++) {
      for (let j = i + 1; j < TOURNAMENT_MODELS.length; j++) {
        pairs.push({
          modelA: TOURNAMENT_MODELS[i],
          modelB: TOURNAMENT_MODELS[j]
        })
      }
    }
    
    return pairs
  }

  /**
   * Check how many completed games exist between two models
   */
  private async getCompletedGamesCount(modelA: string, modelB: string): Promise<number> {
    try {
      // Get model IDs
      const { data: modelAData } = await supabaseAdmin
        .from('models')
        .select('id')
        .eq('name', modelA)
        .single()

      const { data: modelBData } = await supabaseAdmin
        .from('models')
        .select('id')  
        .eq('name', modelB)
        .single()

      if (!modelAData || !modelBData) {
        return 0
      }

      // Count completed matches between these models (bidirectional)
      const { count, error } = await supabaseAdmin
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .or(`and(model_a_id.eq.${modelAData.id},model_b_id.eq.${modelBData.id}),and(model_a_id.eq.${modelBData.id},model_b_id.eq.${modelAData.id})`)

      if (error) {
        console.error(`Error counting games for ${modelA} vs ${modelB}:`, error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error(`Error getting completed games count:`, error)
      return 0
    }
  }

  /**
   * Check tournament progress and return what needs to be done
   */
  async checkTournamentProgress(): Promise<TournamentProgress[]> {
    console.log('🔍 Checking tournament progress...\n')
    
    const pairs = this.getAllModelPairs()
    const progress: TournamentProgress[] = []

    for (const pair of pairs) {
      const completed = await this.getCompletedGamesCount(pair.modelA, pair.modelB)
      const needed = Math.max(0, GAMES_PER_PAIR - completed)
      
      progress.push({
        modelA: pair.modelA,
        modelB: pair.modelB,
        completed,
        needed
      })

      console.log(`📊 ${pair.modelA} vs ${pair.modelB}: ${completed}/${GAMES_PER_PAIR} completed (${needed} needed)`)
    }

    const totalNeeded = progress.reduce((sum, p) => sum + p.needed, 0)
    const totalCompleted = progress.reduce((sum, p) => sum + p.completed, 0)
    
    console.log(`\n📈 Tournament Summary:`)
    console.log(`   Total games completed: ${totalCompleted}`)
    console.log(`   Total games needed: ${totalNeeded}`)
    console.log(`   Total games when complete: ${totalCompleted + totalNeeded}`)
    
    return progress
  }

  /**
   * Run the complete tournament
   */
  async runTournament(dryRun: boolean = false): Promise<void> {
    console.log('🏆 Starting Game Theory Tournament!')
    console.log(`🤖 Models: ${TOURNAMENT_MODELS.join(', ')}`)
    console.log(`🎯 Games per pair: ${GAMES_PER_PAIR}`)
    console.log(`${dryRun ? '🧪 DRY RUN MODE - No games will be executed' : '🚀 LIVE MODE - Games will be executed'}\n`)

    const progress = await this.checkTournamentProgress()
    const pairsNeedingGames = progress.filter(p => p.needed > 0)

    if (pairsNeedingGames.length === 0) {
      console.log('🎉 Tournament is already complete!')
      return
    }

    if (dryRun) {
      console.log('\n📋 Games that would be executed:')
      pairsNeedingGames.forEach(pair => {
        console.log(`   ${pair.modelA} vs ${pair.modelB}: ${pair.needed} games`)
      })
      return
    }

    console.log('\n🎮 Starting game execution...\n')

    let gameNumber = 1
    const totalGamesNeeded = pairsNeedingGames.reduce((sum, p) => sum + p.needed, 0)

    for (const pair of pairsNeedingGames) {
      console.log(`\n🔥 ===== PAIR ${pairsNeedingGames.indexOf(pair) + 1}/${pairsNeedingGames.length} =====`)
      console.log(`⚔️  ${pair.modelA} vs ${pair.modelB}`)
      console.log(`🎯 Need to play ${pair.needed} games`)

      for (let gameInPair = 1; gameInPair <= pair.needed; gameInPair++) {
        console.log(`\n🎲 Game ${gameNumber}/${totalGamesNeeded} (Pair ${gameInPair}/${pair.needed})`)
        
        try {
          console.log(`🎯 Playing: ${pair.modelA} vs ${pair.modelB}`)
          
          const matchId = await this.gameEngine.runMatch(pair.modelA, pair.modelB)
          console.log(`✅ Game completed successfully! Match ID: ${matchId}`)
          
          // Add delay between games to be nice to the APIs
          if (gameNumber < totalGamesNeeded) {
            const delayMinutes = 2
            console.log(`⏳ Cooling down for ${delayMinutes} minutes before next game...`)
            await new Promise(resolve => setTimeout(resolve, delayMinutes * 60 * 1000))
          }

        } catch (error) {
          console.error(`❌ Game ${gameNumber} failed:`, error)
          console.log(`🔄 Continuing with next game...`)
        }

        gameNumber++
      }
    }

    console.log('\n🏁 Tournament execution completed!')
    console.log('🔍 Checking final results...\n')

    await this.checkTournamentProgress()
  }

  /**
   * Resume tournament from where it left off
   */
  async resumeTournament(): Promise<void> {
    console.log('🔄 Resuming tournament...')
    await this.runTournament(false)
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'check'

  const runner = new TournamentRunner()

  switch (command) {
    case 'check':
      await runner.checkTournamentProgress()
      break
    
    case 'dry-run':
      await runner.runTournament(true)
      break
      
    case 'run':
      await runner.runTournament(false)
      break
      
    case 'resume':
      await runner.resumeTournament()
      break
      
    default:
      console.log('🎯 Game Theory Tournament Runner')
      console.log('')
      console.log('Usage:')
      console.log('  npx tsx scripts/tournament.ts check     - Check current progress')
      console.log('  npx tsx scripts/tournament.ts dry-run  - Show what games would be run')
      console.log('  npx tsx scripts/tournament.ts run      - Run the tournament')
      console.log('  npx tsx scripts/tournament.ts resume   - Resume tournament from current state')
      console.log('')
      console.log('Models in tournament:')
      TOURNAMENT_MODELS.forEach(model => console.log(`  - ${model}`))
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { TournamentRunner }
