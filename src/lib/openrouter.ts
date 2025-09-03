interface OpenRouterResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

interface ParsedResponse {
  reasoning: string
  move: 'COOPERATE' | 'DEFECT'
}

export class OpenRouterClient {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions'

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY!
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured')
    }
  }

  async callModel(
    modelName: string, 
    prompt: string, 
    retries = 3
  ): Promise<string> {
    console.log(`🎯 Calling ${modelName}...`)
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
            'X-Title': 'AI Prisoner\'s Dilemma Tournament'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1500,  // Increased for more detailed reasoning
            timeout: 60000     // 60 second timeout
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ ${modelName} API error: ${response.status}`)
          
          // Skip problematic models/providers on certain errors
          if (response.status === 502 || response.status === 503) {
            throw new Error(`${modelName} provider temporarily unavailable (${response.status}). Try a different model.`)
          }
          
          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
        }

        const data: OpenRouterResponse = await response.json()
        
        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from OpenRouter API')
        }

        const aiResponse = data.choices[0].message.content?.trim() || ''
        console.log(`✅ ${modelName} responded (${aiResponse.length} chars)`)
        
        // Check for suspiciously short responses but don't fail immediately
        if (aiResponse.length < 10) {
          console.log(`⚠️ ${modelName} gave a very short response: "${aiResponse}"`)
          // Don't throw error for empty responses - let the parser handle it gracefully
        }
        
        return aiResponse
      } catch (error) {
        console.error(`❌ ${modelName} attempt ${attempt + 1} failed:`, error)
        
        if (attempt === retries - 1) {
          throw error
        }
        
        // Exponential backoff with jitter
        const delay = (Math.pow(2, attempt) * 1000) + (Math.random() * 1000)
        console.log(`⏳ Retrying ${modelName} in ${Math.round(delay)}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('All retry attempts failed')
  }

  parseResponse(response: string): ParsedResponse {
    console.log('🤖 Raw AI Response:', response)
    console.log('🔍 Response length:', response.length)
    
    // Handle empty or whitespace-only responses
    if (!response || response.trim().length === 0) {
      console.log('⚠️ Empty response detected, defaulting to COOPERATE (game theory suggests cooperation is often optimal)')
      return {
        reasoning: 'AI provided empty response. Defaulting to cooperative strategy as per game theory best practices.',
        move: 'COOPERATE'
      }
    }
    
    // Look for the move at the end of the response
    const moveRegex = /MOVE:\s*(COOPERATE|DEFECT)/i
    const moveMatch = response.match(moveRegex)
    
    if (!moveMatch) {
      // Enhanced fallback parsing - look for various patterns
      const lines = response.split('\n').filter(line => line.trim())
      const fullText = response.toUpperCase()
      
      // Try multiple patterns
      const patterns = [
        /(?:MY CHOICE|MY DECISION|I CHOOSE|I WILL|FINAL DECISION).*?(COOPERATE|DEFECT)/i,
        /(?:COOPERATE|DEFECT)(?:\s|$|\.)/i,
        /(COOPERATE|DEFECT)/i
      ]
      
      for (const pattern of patterns) {
        const match = response.match(pattern)
        if (match) {
          const move = match[1] ? match[1].toUpperCase() : match[0].toUpperCase()
          if (move.includes('COOPERATE')) {
            console.log('✅ Parsed move: COOPERATE')
            return {
              reasoning: response.trim(),
              move: 'COOPERATE'
            }
          } else if (move.includes('DEFECT')) {
            console.log('✅ Parsed move: DEFECT')
            return {
              reasoning: response.trim(),
              move: 'DEFECT'
            }
          }
        }
      }
      
      // Last resort: check final few words
      const lastWords = response.split(/\s+/).slice(-5).join(' ').toUpperCase()
      if (lastWords.includes('COOPERATE')) {
        console.log('✅ Fallback parsed: COOPERATE')
        return { reasoning: response.trim(), move: 'COOPERATE' }
      } else if (lastWords.includes('DEFECT')) {
        console.log('✅ Fallback parsed: DEFECT')
        return { reasoning: response.trim(), move: 'DEFECT' }
      }
      
      // Ultimate fallback - if response exists but no clear move, try to be smart about it
      const cooperateWords = ['cooperat', 'trust', 'work together', 'mutual', 'benefit', 'partner']
      const defectWords = ['defect', 'betray', 'exploit', 'advantage', 'selfish', 'compete']
      
      const responseText = response.toLowerCase()
      const cooperateCount = cooperateWords.reduce((count, word) => count + (responseText.includes(word) ? 1 : 0), 0)
      const defectCount = defectWords.reduce((count, word) => count + (responseText.includes(word) ? 1 : 0), 0)
      
      if (cooperateCount > defectCount) {
        console.log('✅ Semantic fallback: COOPERATE (based on keywords)')
        return { reasoning: response.trim(), move: 'COOPERATE' }
      } else if (defectCount > cooperateCount) {
        console.log('✅ Semantic fallback: DEFECT (based on keywords)')
        return { reasoning: response.trim(), move: 'DEFECT' }
      }
      
      // Final fallback - if all else fails, cooperate (game theory suggests this is often optimal)
      console.log('⚠️ No clear move found, defaulting to COOPERATE')
      return {
        reasoning: response.trim() || 'AI response unclear, defaulting to cooperative strategy',
        move: 'COOPERATE'
      }
    }

    const move = moveMatch[1].toUpperCase() as 'COOPERATE' | 'DEFECT'
    const reasoning = response.replace(moveRegex, '').trim()
    
    console.log(`✅ Parsed move: ${move}`)
    return { reasoning, move }
  }

  createPrompt(
    opponentModel: string,
    gameHistory: Array<{
      round: number
      myMove: 'COOPERATE' | 'DEFECT'
      opponentMove: 'COOPERATE' | 'DEFECT'
      myScore: number
      opponentScore: number
    }>,
    currentRound: number
  ): string {
    const historyText = gameHistory.length > 0 
      ? gameHistory.map(h => 
          `Round ${h.round}: You played ${h.myMove}, your rival played ${h.opponentMove}. You scored ${h.myScore}, they scored ${h.opponentScore}.`
        ).join('\n')
      : 'No previous rounds.'

    const totalMyScore = gameHistory.reduce((sum, h) => sum + h.myScore, 0)
    const totalOpponentScore = gameHistory.reduce((sum, h) => sum + h.opponentScore, 0)

    return `🎮 PRISONER'S DILEMMA TOURNAMENT 🎮

You are an AI model competing in a strategic battle against an anonymous rival in a 20-round Prisoner's Dilemma game.

**RULES:**
Each round, you and your opponent simultaneously choose COOPERATE or DEFECT.

**PAYOFF MATRIX:**
• Both COOPERATE → You: 3 pts, Opponent: 3 pts (mutual benefit)
• You COOPERATE, Opponent DEFECTS → You: 0 pts, Opponent: 5 pts (you get exploited)
• You DEFECT, Opponent COOPERATES → You: 5 pts, Opponent: 0 pts (you exploit them)
• Both DEFECT → You: 1 pt, Opponent: 1 pt (mutual punishment)

**CURRENT STATUS:**
• Round: ${currentRound} of 20
• Your total score: ${totalMyScore}
• Your rival's total score: ${totalOpponentScore}

**GAME HISTORY:**
${historyText}

**YOUR STRATEGIC ANALYSIS:**
Consider these factors:
1. What patterns do you see in your opponent's behavior?
2. What game theory strategy should you employ? (Tit-for-tat, always cooperate, always defect, pavlov, etc.)
3. How many rounds remain? Should you be more aggressive near the end?
4. Are you winning, losing, or tied? How does this affect your strategy?

**IMPORTANT:** 
After your analysis, you MUST end your response with EXACTLY one of these lines:
MOVE: COOPERATE
MOVE: DEFECT

Think strategically and choose wisely. Your reputation as an AI strategist is on the line!`
  }
}
