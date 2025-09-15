#!/usr/bin/env npx tsx

import { config } from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../.env.local')
config({ path: envPath })

// Verify environment variables are loaded
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Environment variables not loaded. Make sure .env.local exists and contains:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY') 
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

import { supabaseAdmin } from '../src/lib/supabase'

interface ModelStats {
  wins: number
  losses: number
  total_score: number
}

/**
 * Recalculate all model statistics from completed matches
 */
async function recalculateModelStatistics(): Promise<void> {
  console.log('🔄 Recalculating model statistics from completed matches...\n')

  try {
    // Get all models
    const { data: models, error: modelsError } = await supabaseAdmin
      .from('models')
      .select('id, name, wins, losses, total_score')

    if (modelsError) {
      throw new Error(`Failed to fetch models: ${modelsError.message}`)
    }

    if (!models || models.length === 0) {
      console.log('No models found.')
      return
    }

    // Get all completed matches
    const { data: matches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select('id, model_a_id, model_b_id, model_a_final_score, model_b_final_score, winner_id')
      .eq('status', 'completed')

    if (matchesError) {
      throw new Error(`Failed to fetch matches: ${matchesError.message}`)
    }

    console.log(`📊 Found ${models.length} models and ${matches?.length || 0} completed matches`)

    // Calculate fresh statistics for each model
    const modelStats = new Map<string, ModelStats>()

    // Initialize all models with zero stats
    models.forEach(model => {
      modelStats.set(model.id, { wins: 0, losses: 0, total_score: 0 })
    })

    // Process each completed match
    if (matches) {
      matches.forEach(match => {
        const modelAStats = modelStats.get(match.model_a_id)
        const modelBStats = modelStats.get(match.model_b_id)

        if (!modelAStats || !modelBStats) {
          console.warn(`⚠️  Skipping match ${match.id}: model not found`)
          return
        }

        // Add scores
        modelAStats.total_score += match.model_a_final_score || 0
        modelBStats.total_score += match.model_b_final_score || 0

        // Add wins/losses
        if (match.winner_id === match.model_a_id) {
          modelAStats.wins++
          modelBStats.losses++
        } else if (match.winner_id === match.model_b_id) {
          modelBStats.wins++
          modelAStats.losses++
        } else {
          // Draw or no winner - count as loss for both (shouldn't happen in this game)
          modelAStats.losses++
          modelBStats.losses++
        }
      })
    }

    // Update each model in the database
    console.log('\n📝 Updating model statistics...')
    
    for (const model of models) {
      const oldStats = model
      const newStats = modelStats.get(model.id)!
      
      const gamesPlayed = newStats.wins + newStats.losses
      const avgScore = gamesPlayed > 0 ? (newStats.total_score / gamesPlayed).toFixed(1) : '0.0'
      
      console.log(`🔄 ${model.name}:`)
      console.log(`   Old: ${oldStats.wins}W/${oldStats.losses}L, total: ${oldStats.total_score}, avg: ${(oldStats.wins + oldStats.losses) > 0 ? (oldStats.total_score / (oldStats.wins + oldStats.losses)).toFixed(1) : '0.0'}`)
      console.log(`   New: ${newStats.wins}W/${newStats.losses}L, total: ${newStats.total_score}, avg: ${avgScore}`)

      // Update in database
      const { error: updateError } = await supabaseAdmin
        .from('models')
        .update({
          wins: newStats.wins,
          losses: newStats.losses,
          total_score: newStats.total_score
        })
        .eq('id', model.id)

      if (updateError) {
        console.error(`❌ Failed to update ${model.name}: ${updateError.message}`)
      } else {
        console.log(`   ✅ Updated successfully`)
      }
      console.log()
    }

    console.log('🎉 Model statistics recalculation completed!')
    
    // Summary
    const totalGames = matches?.length || 0
    const totalScored = Array.from(modelStats.values()).reduce((sum, stats) => sum + stats.total_score, 0)
    console.log(`\n📈 Summary:`)
    console.log(`   Total completed matches: ${totalGames}`)
    console.log(`   Total points awarded: ${totalScored}`)
    console.log(`   Models updated: ${models.length}`)

  } catch (error) {
    console.error('❌ Error recalculating statistics:', error)
    process.exit(1)
  }
}

/**
 * Verify the recalculation by comparing current stats with fresh calculation
 */
async function verifyStatistics(): Promise<void> {
  console.log('🔍 Verifying model statistics consistency...\n')

  try {
    // Get current model stats
    const { data: models, error: modelsError } = await supabaseAdmin
      .from('models')
      .select('id, name, wins, losses, total_score')

    if (modelsError) {
      throw new Error(`Failed to fetch models: ${modelsError.message}`)
    }

    if (!models || models.length === 0) {
      console.log('No models found.')
      return
    }

    // Get all completed matches
    const { data: matches, error: matchesError } = await supabaseAdmin
      .from('matches')
      .select('id, model_a_id, model_b_id, model_a_final_score, model_b_final_score, winner_id')
      .eq('status', 'completed')

    if (matchesError) {
      throw new Error(`Failed to fetch matches: ${matchesError.message}`)
    }

    // Calculate expected statistics
    const expectedStats = new Map<string, ModelStats>()
    models.forEach(model => {
      expectedStats.set(model.id, { wins: 0, losses: 0, total_score: 0 })
    })

    if (matches) {
      matches.forEach(match => {
        const modelAStats = expectedStats.get(match.model_a_id)
        const modelBStats = expectedStats.get(match.model_b_id)

        if (!modelAStats || !modelBStats) return

        modelAStats.total_score += match.model_a_final_score || 0
        modelBStats.total_score += match.model_b_final_score || 0

        if (match.winner_id === match.model_a_id) {
          modelAStats.wins++
          modelBStats.losses++
        } else if (match.winner_id === match.model_b_id) {
          modelBStats.wins++
          modelAStats.losses++
        } else {
          modelAStats.losses++
          modelBStats.losses++
        }
      })
    }

    // Compare current vs expected
    let allCorrect = true
    console.log('📊 Verification Results:')
    
    models.forEach(model => {
      const current = model
      const expected = expectedStats.get(model.id)!
      
      const isCorrect = 
        current.wins === expected.wins &&
        current.losses === expected.losses &&
        current.total_score === expected.total_score

      if (!isCorrect) {
        allCorrect = false
        console.log(`❌ ${model.name}: MISMATCH`)
        console.log(`   Current:  ${current.wins}W/${current.losses}L, total: ${current.total_score}`)
        console.log(`   Expected: ${expected.wins}W/${expected.losses}L, total: ${expected.total_score}`)
      } else {
        console.log(`✅ ${model.name}: OK (${current.wins}W/${current.losses}L, total: ${current.total_score})`)
      }
    })

    if (allCorrect) {
      console.log('\n🎉 All model statistics are consistent!')
    } else {
      console.log('\n⚠️  Some model statistics are inconsistent. Run recalculation to fix.')
    }

  } catch (error) {
    console.error('❌ Error verifying statistics:', error)
    process.exit(1)
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'verify'

  switch (command) {
    case 'verify':
      await verifyStatistics()
      break
      
    case 'recalculate':
      await recalculateModelStatistics()
      break
      
    default:
      console.log('📊 Model Statistics Recalculator')
      console.log('')
      console.log('Usage:')
      console.log('  npx tsx scripts/recalculate-stats.ts verify       - Check if stats are consistent')
      console.log('  npx tsx scripts/recalculate-stats.ts recalculate  - Recalculate all model statistics')
      console.log('')
      console.log('This tool fixes model wins/losses/total_score when matches have been deleted and re-run.')
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { recalculateModelStatistics, verifyStatistics }
