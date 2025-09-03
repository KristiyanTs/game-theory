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
    retries = 1  // Reduced from 3 to 1 to avoid retry storms
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
            timeout: 30000     // 30 second timeout - reduced to fail faster
          })
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ ${modelName} API error: ${response.status}`)
          
          // Skip problematic models/providers on certain errors
          if (response.status === 502 || response.status === 503) {
            throw new Error(`${modelName} provider temporarily unavailable (${response.status}). Try a different model.`)
          }
          
          if (response.status === 401) {
            throw new Error(`OpenRouter API authentication failed (${response.status}). Check OPENROUTER_API_KEY.`)
          }
          
          if (response.status === 429) {
            // For rate limiting, add extra delay even on first attempt
            if (attempt === 0) {
              console.log(`🚦 ${modelName} rate limited on first attempt, adding extra delay...`)
              await new Promise(resolve => setTimeout(resolve, 15000)) // 15s immediate delay
            }
            throw new Error(`${modelName} rate limit exceeded (${response.status}). Implementing delay before retry.`)
          }
          
          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
        }

        const data: OpenRouterResponse = await response.json()
        
        if (!data.choices || data.choices.length === 0) {
          throw new Error('No response from OpenRouter API')
        }

        const aiResponse = data.choices[0].message.content?.trim() || ''
        console.log(`✅ ${modelName} responded (${aiResponse.length} chars)`)
        
        // Check for empty responses - these are likely API overload
        if (aiResponse.length === 0) {
          console.log(`🚦 ${modelName} returned completely empty response - API may be overloaded`)
          if (attempt < retries - 1) {
            console.log(`🔄 Empty response, waiting longer before retry...`)
            await new Promise(resolve => setTimeout(resolve, 20000)) // 20s delay for empty responses
            throw new Error(`Empty response from ${modelName} - API overloaded`)
          }
          console.log(`⚠️ Final attempt also empty, will handle gracefully in parser`)
        }
        
        // Check for other suspiciously short responses
        else if (aiResponse.length < 10) {
          console.log(`⚠️ ${modelName} gave a very short response: "${aiResponse}"`)
          if (attempt < retries - 1) {
            console.log(`🔄 Response too short, retrying (attempt ${attempt + 1}/${retries})...`)
            throw new Error(`Response too short: "${aiResponse}"`)
          }
        }
        
        return aiResponse
      } catch (error) {
        console.error(`❌ ${modelName} attempt ${attempt + 1} failed:`, error)
        
        if (attempt === retries - 1) {
          throw error
        }
        
        // Shorter delay since we only retry once now
        const delay = 10000 + (Math.random() * 5000) // 10-15 seconds
        console.log(`⏳ Rate limited - retrying ${modelName} in ${Math.round(delay/1000)}s... (attempt ${attempt + 1}/${retries})`)
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
      console.log('❌ Empty response detected - treating as random choice to avoid API storms')
      const randomMove = Math.random() > 0.5 ? 'COOPERATE' : 'DEFECT'
      return {
        reasoning: 'API returned empty response - made random choice to avoid overwhelming the service',
        move: randomMove
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
      
      // Final fallback - if all else fails, make a random choice to avoid bias
      const randomMove = Math.random() > 0.5 ? 'COOPERATE' : 'DEFECT'
      console.log(`⚠️ No clear move found, making random choice: ${randomMove}`)
      return {
        reasoning: response.trim() || `AI response unclear, made random choice: ${randomMove}`,
        move: randomMove
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
