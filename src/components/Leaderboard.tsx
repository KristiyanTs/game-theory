'use client'

import { useState, useEffect } from 'react'
import type { Model } from '@/lib/supabase'

export function Leaderboard() {
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }
      const data = await response.json()
      setModels(data)
    } catch (err) {
      console.error('Error fetching models:', err)
      setError('Unable to load leaderboard data')
    } finally {
      setLoading(false)
    }
  }

  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses
    if (total === 0) return 0
    return (wins / total) * 100
  }

  const formatModelName = (name: string) => {
    // Extract the model name from the full path (e.g., "openai/gpt-4" -> "GPT-4")
    const parts = name.split('/')
    const modelName = parts[parts.length - 1]
    return modelName.toUpperCase().replace(/-/g, '-')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error text-lg">{error}</p>
        <button 
          onClick={fetchModels}
          className="mt-4 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted text-lg">No AI models have battled yet.</p>
        <p className="text-sm text-muted mt-2">Run your first match to see the leaderboard!</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="bg-secondary rounded-lg border border-border">
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">AI Model</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Wins</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Losses</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Win Rate</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {models.map((model, index) => {
                const winRate = calculateWinRate(model.wins, model.losses)
                const isTop3 = index < 3
                
                return (
                  <tr key={model.id} className="hover:bg-border/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-bold ${isTop3 ? 'text-accent' : 'text-foreground'}`}>
                          #{index + 1}
                        </span>
                        {index === 0 && <span className="text-xl">👑</span>}
                        {index === 1 && <span className="text-xl">🥈</span>}
                        {index === 2 && <span className="text-xl">🥉</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm">
                        <div className="font-semibold text-foreground">{formatModelName(model.name)}</div>
                        <div className="text-xs text-muted truncate max-w-[200px]">{model.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-success font-semibold">{model.wins}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-error font-semibold">{model.losses}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="font-semibold">{winRate.toFixed(1)}%</span>
                        <div className="w-16 bg-border rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full transition-all duration-300"
                            style={{ width: `${winRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-foreground">{model.total_score.toLocaleString()}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
