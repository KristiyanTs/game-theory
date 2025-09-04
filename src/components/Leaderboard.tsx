'use client'

import { useState, useEffect } from 'react'
import type { Model } from '@/lib/supabase'
import type { BehavioralMetrics } from '@/lib/behavioral-metrics'

interface ModelWithMetrics extends Model {
  behavioralMetrics: BehavioralMetrics
  personalityArchetype: {
    archetype: string
    description: string
    emoji: string
  }
}

export function Leaderboard() {
  const [models, setModels] = useState<ModelWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/behavioral-metrics')
      if (!response.ok) {
        throw new Error('Failed to fetch behavioral data')
      }
      const data = await response.json()
      setModels(data)
    } catch (err) {
      console.error('Error fetching behavioral data:', err)
      setError('Unable to load character profiles. Data may be unavailable.')
    } finally {
      setLoading(false)
    }
  }

  const formatModelName = (name: string) => {
    // Extract the model name from the full path (e.g., "openai/gpt-4" -> "GPT-4")
    const parts = name.split('/')
    const modelName = parts[parts.length - 1]
    return modelName.toUpperCase().replace(/-/g, '-')
  }

  const MetricBar = ({ value, color = 'accent', label }: { value: number; color?: string; label: string }) => {
    const getColorClass = (colorType: string) => {
      switch (colorType) {
        case 'success': return 'bg-success'
        case 'warning': return 'bg-warning'
        case 'error': return 'bg-error'
        case 'accent': return 'bg-accent'
        default: return 'bg-accent'
      }
    }

    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted text-xs">{label}</span>
          <span className="font-semibold text-xs">{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-1.5">
          <div 
            className={`${getColorClass(color)} h-1.5 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(value, 100)}%` }}
          ></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="modern-card">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-lg h-8 w-8 border-2 border-accent border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modern-card">
        <div className="text-center py-12">
          <p className="text-error text-lg">{error}</p>
          <button 
            onClick={fetchModels}
            className="mt-4 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="modern-card">
        <div className="text-center py-12">
          <p className="text-muted text-lg">No AI character data available yet.</p>
          <p className="text-sm text-muted mt-2">Run matches to reveal AI personalities!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {models.map((model, index) => {
        const { behavioralMetrics, personalityArchetype } = model
        const isTop3 = index < 3
        
        return (
          <div key={model.id} className="modern-card hover:border-accent/50 transition-all duration-300 p-4">
            <div className="flex items-center justify-between gap-6">
              {/* Left: Rank & Model Info */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xl font-bold ${isTop3 ? 'text-accent' : 'text-foreground'}`}>
                    #{index + 1}
                  </span>
                  {index === 0 && <span className="text-xl">👑</span>}
                  {index === 1 && <span className="text-xl">🥈</span>}
                  {index === 2 && <span className="text-xl">🥉</span>}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-foreground truncate">{formatModelName(model.name)}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{personalityArchetype.emoji}</span>
                    <span className="text-accent font-medium">{personalityArchetype.archetype}</span>
                  </div>
                </div>
              </div>

              {/* Center: Score */}
              <div className="text-center min-w-0">
                <div className="text-xl font-bold text-foreground">
                  {(model.wins + model.losses) > 0 
                    ? (model.total_score / (model.wins + model.losses)).toFixed(1)
                    : '0.0'
                  }
                </div>
                <div className="text-xs text-muted">Avg Score ({model.wins + model.losses} games)</div>
              </div>

              {/* Right: Key Metrics */}
              <div className="grid grid-cols-3 gap-4 min-w-0">
                <div className="text-center">
                  <div className="text-sm font-bold text-success">{behavioralMetrics.cooperationRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted">Cooperation</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-warning">{behavioralMetrics.retaliationRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted">Retaliation</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-error">{behavioralMetrics.tyrantIndex.toFixed(0)}%</div>
                  <div className="text-xs text-muted">Tyrant Index</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      
      {models.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted text-lg">No character profiles available yet.</p>
          <p className="text-sm text-muted mt-2">AI personalities will emerge as they battle!</p>
        </div>
      )}
    </div>
  )
}
