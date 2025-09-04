import { supabaseAdmin } from './supabase'
import { OpenRouterClient } from './openrouter'
import type { Model } from './supabase'

interface GameState {
  round: number
  modelAHistory: Array<{
    round: number
    myMove: 'COOPERATE' | 'DEFECT'
    opponentMove: 'COOPERATE' | 'DEFECT'
    myScore: number
    opponentScore: number
  }>
  modelBHistory: Array<{
    round: number
    myMove: 'COOPERATE' | 'DEFECT'
    opponentMove: 'COOPERATE' | 'DEFECT'
    myScore: number
    opponentScore: number
  }>
  modelAScore: number
  modelBScore: number
}

export class GameEngine {
  private openRouter: OpenRouterClient
  private readonly TOTAL_ROUNDS = 20
  
  // Prisoner's Dilemma payoff matrix
  private readonly PAYOFFS = {
    'COOPERATE-COOPERATE': { player: 3, opponent: 3 },
    'COOPERATE-DEFECT': { player: 0, opponent: 5 },
    'DEFECT-COOPERATE': { player: 5, opponent: 0 },
    'DEFECT-DEFECT': { player: 1, opponent: 1 }
  }

  constructor() {
    this.openRouter = new OpenRouterClient()
  }

  async runMatch(modelAName: string, modelBName: string): Promise<string> {
    console.log(`\n🚀 ================================`)
    console.log(`🎯 EPIC AI BATTLE INITIATED!`)
    console.log(`⚔️  ${modelAName}`)
    console.log(`    VS`)
    console.log(`⚔️  ${modelBName}`)
    console.log(`🏟️  20 rounds of strategic warfare`)
    console.log(`================================\n`)
    
    try {
      // Create or get models
      const modelA = await this.getOrCreateModel(modelAName)
      const modelB = await this.getOrCreateModel(modelBName)

      // Create match record
      const { data: match, error: matchError } = await supabaseAdmin
        .from('matches')
        .insert({
          model_a_id: modelA.id,
          model_b_id: modelB.id,
          status: 'in_progress'
        })
        .select()
        .single()

      if (matchError) {
        throw new Error(`Failed to create match: ${matchError.message}`)
      }

      console.log(`📝 Match ID: ${match.id}`)

      // Initialize game state
      const gameState: GameState = {
        round: 1,
        modelAHistory: [],
        modelBHistory: [],
        modelAScore: 0,
        modelBScore: 0
      }

      // Play all rounds
      for (let round = 1; round <= this.TOTAL_ROUNDS; round++) {
        gameState.round = round
        
        try {
          const roundResult = await this.playRound(
            match.id,
            modelAName,
            modelBName,
            gameState
          )
  

          // Update game state with round results
          gameState.modelAHistory.push({
            round,
            myMove: roundResult.modelAMove,
            opponentMove: roundResult.modelBMove,
            myScore: roundResult.modelAScore,
            opponentScore: roundResult.modelBScore
          })

          gameState.modelBHistory.push({
            round,
            myMove: roundResult.modelBMove,
            opponentMove: roundResult.modelAMove,
            myScore: roundResult.modelBScore,
            opponentScore: roundResult.modelAScore
          })

          gameState.modelAScore += roundResult.modelAScore
          gameState.modelBScore += roundResult.modelBScore
          
          console.log(`📈 Running totals: ${modelAName}: ${gameState.modelAScore}, ${modelBName}: ${gameState.modelBScore}`)
          
          // Add intelligent delay between rounds based on account limits
          if (round < this.TOTAL_ROUNDS) {
            const roundDelay = 15000
            console.log(`⏳ Smart cooling down ${roundDelay/1000}s before next round...`)
            await new Promise(resolve => setTimeout(resolve, roundDelay))
          }
          
        } catch (roundError) {
          console.error(`💥 Round ${round} failed:`, roundError)

          // Stop the match
          throw roundError
        }
      }

      // Determine winner
      let winnerId = null
      let winnerName = 'TIE'
      if (gameState.modelAScore > gameState.modelBScore) {
        winnerId = modelA.id
        winnerName = modelAName
      } else if (gameState.modelBScore > gameState.modelAScore) {
        winnerId = modelB.id
        winnerName = modelBName
      }

      // Update match with final results
      await supabaseAdmin
        .from('matches')
        .update({
          model_a_final_score: gameState.modelAScore,
          model_b_final_score: gameState.modelBScore,
          winner_id: winnerId,
          status: 'completed'
        })
        .eq('id', match.id)

      // Update model statistics
      await this.updateModelStats(modelA.id, gameState.modelAScore, winnerId === modelA.id)
      await this.updateModelStats(modelB.id, gameState.modelBScore, winnerId === modelB.id)

      console.log(`\n🏆 ================================`)
      console.log(`🎉 BATTLE COMPLETED!`)
      console.log(`📊 Final Scores:`)
      console.log(`   ${modelAName}: ${gameState.modelAScore}`)
      console.log(`   ${modelBName}: ${gameState.modelBScore}`)
      console.log(`👑 WINNER: ${winnerName}`)
      console.log(`================================\n`)
      
      return match.id
    } catch (error) {
      console.error('💥 Match catastrophically failed:', error)
      throw error
    }
  }

  private async playRound(
    matchId: string,
    modelAName: string,
    modelBName: string,
    gameState: GameState
  ) {
    console.log(`\n🎮 === ROUND ${gameState.round}/20 ===`)
    
    // Generate prompts for both models (using generic labels to anonymize opponent)
    const promptA = this.openRouter.createPrompt('Rival', gameState.modelAHistory, gameState.round)
    const promptB = this.openRouter.createPrompt('Rival', gameState.modelBHistory, gameState.round)
    
    try {
      // Call models sequentially to reduce API pressure and rate limiting
      console.log(`🎯 Calling ${modelAName} first...`)
      const responseAValue = await this.openRouter.callModel(modelAName, promptA).catch(error => {
        console.error(`⚠️ ${modelAName} failed:`, error.message)
        return ''
      })
      console.log(`🎯 ${modelAName} response:`, responseAValue)

      await new Promise(resolve => setTimeout(resolve, 15000))

      console.log(`🎯 Calling ${modelBName} second...`)
      const responseBValue = await this.openRouter.callModel(modelBName, promptB).catch(error => {
        console.error(`⚠️ ${modelBName} failed:`, error.message)
        return ''
      })

      // Parse responses and check for empty response pattern
      const parsedA = this.openRouter.parseResponse(responseAValue)
      const parsedB = this.openRouter.parseResponse(responseBValue)

      // Return info about empty responses for tracking at match level
      const hasEmptyResponse = !responseAValue || !responseBValue
      if (hasEmptyResponse) {
        console.log(`⚠️ Empty response detected in round ${gameState.round}`)
      }

      // Calculate scores
      const payoffKey = `${parsedA.move}-${parsedB.move}` as keyof typeof this.PAYOFFS
      const payoffs = this.PAYOFFS[payoffKey]

      console.log(`\n🎯 MOVES: ${modelAName} plays ${parsedA.move}, ${modelBName} plays ${parsedB.move}`)
      console.log(`📊 SCORES: ${modelAName} +${payoffs.player}, ${modelBName} +${payoffs.opponent}`)

      // Save round to database
      await supabaseAdmin
        .from('rounds')
        .insert({
          match_id: matchId,
          round_number: gameState.round,
          model_a_move: parsedA.move,
          model_b_move: parsedB.move,
          model_a_reasoning: parsedA.reasoning,
          model_b_reasoning: parsedB.reasoning,
          model_a_score: payoffs.player,
          model_b_score: payoffs.opponent
        })

      return {
        modelAMove: parsedA.move,
        modelBMove: parsedB.move,
        modelAScore: payoffs.player,
        modelBScore: payoffs.opponent,
        modelAReasoning: parsedA.reasoning,
        modelBReasoning: parsedB.reasoning,
        hasEmptyResponse: hasEmptyResponse
      }
    } catch (error) {
      console.error(`❌ Round ${gameState.round} failed:`, error)
      throw error
    }
  }

  private async getOrCreateModel(modelName: string): Promise<Model> {
    // Try to get existing model
    const { data: existingModel } = await supabaseAdmin
      .from('models')
      .select('*')
      .eq('name', modelName)
      .single()

    if (existingModel) {
      return existingModel
    }

    // Create new model
    const { data: newModel, error } = await supabaseAdmin
      .from('models')
      .insert({ name: modelName })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create model: ${error.message}`)
    }

    return newModel
  }

  private async updateModelStats(modelId: string, totalScore: number, won: boolean) {
    const { data: model } = await supabaseAdmin
      .from('models')
      .select('wins, losses, total_score')
      .eq('id', modelId)
      .single()

    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    await supabaseAdmin
      .from('models')
      .update({
        wins: model.wins + (won ? 1 : 0),
        losses: model.losses + (won ? 0 : 1),
        total_score: model.total_score + totalScore
      })
      .eq('id', modelId)
  }
}
