import { NextRequest, NextResponse } from 'next/server'
import { GameEngine } from '@/lib/game-engine'

export async function POST(request: NextRequest) {
  try {
    const { modelA, modelB, adminPassword } = await request.json()

    // Validate admin password
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate input
    if (!modelA || !modelB) {
      return NextResponse.json(
        { error: 'Both modelA and modelB are required' },
        { status: 400 }
      )
    }

    if (modelA === modelB) {
      return NextResponse.json(
        { error: 'Models must be different' },
        { status: 400 }
      )
    }

    // Run the match
    const gameEngine = new GameEngine()
    const matchId = await gameEngine.runMatch(modelA, modelB)

    return NextResponse.json({ 
      success: true, 
      matchId,
      message: `Match completed between ${modelA} and ${modelB}`
    })

  } catch (error) {
    console.error('Error running match:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to run match',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
