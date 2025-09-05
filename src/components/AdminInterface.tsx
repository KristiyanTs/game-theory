'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ModelLogoIcon } from '@/lib/model-logos'

interface MatchResult {
  success: boolean
  matchId?: string
  message?: string
  error?: string
  details?: string
}

export function AdminInterface() {
  const [modelA, setModelA] = useState('')
  const [modelB, setModelB] = useState('')
  const [password, setPassword] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)

  const popularModels = [
    // Most reliable models first
    'openai/gpt-4o',
    'openai/gpt-4o-mini', 
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-3.5-haiku',
    'google/gemini-2.0-flash-exp',
    'meta-llama/llama-3.2-90b-vision-instruct',
    'qwen/qwen-2.5-72b-instruct',
    'mistralai/mistral-large',
    'cohere/command-r-plus',
    'deepseek/deepseek-v3'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!modelA || !modelB || !password) {
      setResult({
        success: false,
        error: 'Please fill in all fields'
      })
      return
    }

    if (modelA === modelB) {
      setResult({
        success: false,
        error: 'Please select different models'
      })
      return
    }

    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch('/api/matches/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelA,
          modelB,
          adminPassword: password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          matchId: data.matchId,
          message: data.message
        })
        // Clear form
        setModelA('')
        setModelB('')
      } else {
        setResult({
          success: false,
          error: data.error,
          details: data.details
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const setQuickModel = (model: string, target: 'A' | 'B') => {
    if (target === 'A') {
      setModelA(model)
    } else {
      setModelB(model)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="section-title">🎮 Admin Control Panel</h1>
        <p className="text-muted">
          Initiate epic AI battles in the Prisoner's Dilemma arena. 
          Choose your fighters and watch them strategize for 10 intense rounds.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-secondary rounded-lg border border-border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Admin Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-foreground">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none transition-colors"
              placeholder="Enter admin password"
              disabled={isRunning}
            />
          </div>

          {/* Model Selection */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Model A */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="modelA" className="block text-sm font-semibold text-foreground">
                  Fighter A
                </label>
                <input
                  type="text"
                  id="modelA"
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none transition-colors font-mono text-sm"
                  placeholder="e.g., openai/gpt-4o"
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted">Quick Select:</p>
                <div className="grid grid-cols-1 gap-2">
                  {popularModels.slice(0, 5).map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => setQuickModel(model, 'A')}
                      className="text-left px-3 py-2 text-xs bg-background hover:bg-border border border-border rounded-lg transition-colors font-mono flex items-center gap-2"
                      disabled={isRunning}
                    >
                      <ModelLogoIcon modelName={model} size={14} />
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="hidden md:flex items-center justify-center">
              <div className="text-4xl font-bold text-accent">VS</div>
            </div>

            {/* Model B */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="modelB" className="block text-sm font-semibold text-foreground">
                  Fighter B
                </label>
                <input
                  type="text"
                  id="modelB"
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:border-accent focus:outline-none transition-colors font-mono text-sm"
                  placeholder="e.g., anthropic/claude-3.5-sonnet"
                  disabled={isRunning}
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted">Quick Select:</p>
                <div className="grid grid-cols-1 gap-2">
                  {popularModels.slice(5, 10).map((model) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => setQuickModel(model, 'B')}
                      className="text-left px-3 py-2 text-xs bg-background hover:bg-border border border-border rounded-lg transition-colors font-mono flex items-center gap-2"
                      disabled={isRunning}
                    >
                      <ModelLogoIcon modelName={model} size={14} />
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isRunning || !modelA || !modelB || !password}
              className="w-full px-8 py-4 bg-accent hover:bg-accent-hover disabled:bg-muted disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              {isRunning ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Battle in Progress... ⚔️</span>
                </div>
              ) : (
                'Initiate Battle ⚡'
              )}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        {isRunning && (
          <div className="mt-6 p-4 bg-background rounded-lg border border-border">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted">Running 10 rounds of strategic warfare...</p>
              <p className="text-xs text-muted">This may take 2-5 minutes depending on model response times.</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`mt-6 p-4 rounded-lg border ${result.success ? 'border-success bg-success/10' : 'border-error bg-error/10'}`}>
            {result.success ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-success">✅</span>
                  <span className="font-semibold text-success">Battle Completed!</span>
                </div>
                <p className="text-sm text-foreground">{result.message}</p>
                {result.matchId && (
                  <Link
                    href={`/matches/${result.matchId}`}
                    className="inline-block px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
                  >
                    View Battle Results →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-error">❌</span>
                  <span className="font-semibold text-error">Battle Failed</span>
                </div>
                <p className="text-sm text-foreground">{result.error}</p>
                {result.details && (
                  <p className="text-xs text-muted font-mono">{result.details}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-secondary rounded-lg border border-border p-6">
        <h3 className="subsection-title">Battle Instructions</h3>
                  <div className="space-y-3 text-sm text-muted">
          <p>
            <strong>Model Format:</strong> Use the full OpenRouter model name (e.g., "openai/gpt-4o" or "anthropic/claude-3.5-sonnet")
          </p>
          <p>
            <strong>Battle Duration:</strong> Each match consists of 10 rounds of Prisoner's Dilemma
          </p>
          <p>
            <strong>Scoring:</strong> Cooperate/Cooperate = 3/3, Cooperate/Defect = 0/5, Defect/Defect = 1/1
          </p>
          <p>
            <strong>Analysis:</strong> View detailed round-by-round reasoning and strategic evolution
          </p>
          <p className="text-warning">
            <strong>⚠️ Tip:</strong> Some models (like x-ai/grok variants) may have reliability issues. Stick to OpenAI, Anthropic, Google, or Meta models for best results.
          </p>
        </div>
      </div>
    </div>
  )
}
