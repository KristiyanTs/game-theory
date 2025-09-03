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
          <span className="text-muted">{label}</span>
          <span className="font-semibold">{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-border rounded-full h-2">
          <div 
            className={`${getColorClass(color)} h-2 rounded-full transition-all duration-300`}
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
    <div className="space-y-6">
      {models.map((model, index) => {
        const { behavioralMetrics, personalityArchetype } = model
        const isTop3 = index < 3
        
        return (
          <div key={model.id} className="modern-card hover:border-accent/50 transition-all duration-300">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Model Identity & Archetype */}
              <div className="lg:w-1/3 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${isTop3 ? 'text-accent' : 'text-foreground'}`}>
                      #{index + 1}
                    </span>
                    {index === 0 && <span className="text-2xl">👑</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-foreground">{formatModelName(model.name)}</h3>
                  <p className="text-sm text-muted font-mono truncate">{model.name}</p>
                </div>

                <div className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{personalityArchetype.emoji}</span>
                    <div>
                      <h4 className="font-bold text-accent text-lg">{personalityArchetype.archetype}</h4>
                      <p className="text-sm text-muted leading-tight">{personalityArchetype.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{model.total_score.toLocaleString()}</div>
                    <div className="text-xs text-muted uppercase tracking-wide">Total Score</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{behavioralMetrics.totalRounds}</div>
                    <div className="text-xs text-muted uppercase tracking-wide">Rounds Played</div>
                  </div>
                </div>
              </div>

              {/* Right: Behavioral Metrics */}
              <div className="lg:w-2/3 space-y-4">
                <h4 className="text-lg font-bold text-foreground mb-4">🧬 Character Analysis</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary Metrics */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-accent uppercase tracking-wide">Core Behavior</h5>
                    <MetricBar 
                      value={behavioralMetrics.cooperationRate} 
                      color="success" 
                      label="Cooperation Rate" 
                    />
                    <MetricBar 
                      value={behavioralMetrics.firstMoveCooperationRate} 
                      color="success" 
                      label="First Move Peace" 
                    />
                    <MetricBar 
                      value={behavioralMetrics.synergyScore} 
                      color="success" 
                      label="Synergy Score" 
                    />
                  </div>

                  {/* Strategic Metrics */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-accent uppercase tracking-wide">Strategic Patterns</h5>
                    <MetricBar 
                      value={behavioralMetrics.retaliationRate} 
                      color="warning" 
                      label="Retaliation Rate" 
                    />
                    <MetricBar 
                      value={behavioralMetrics.forgivenessRate} 
                      color="success" 
                      label="Forgiveness Rate" 
                    />
                    <MetricBar 
                      value={behavioralMetrics.tyrantIndex} 
                      color="error" 
                      label="Tyrant Index" 
                    />
                  </div>
                </div>

                {/* Key Insights */}
                <div className="mt-4 p-3 bg-secondary/20 rounded-lg border border-border/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
                    <div>
                      <div className="font-bold text-foreground">{behavioralMetrics.mutualCooperations}</div>
                      <div className="text-xs text-muted">Mutual Trust</div>
                    </div>
                    <div>
                      <div className="font-bold text-error">{behavioralMetrics.tyrantPayoffs}</div>
                      <div className="text-xs text-muted">Exploitation</div>
                    </div>
                    <div>
                      <div className="font-bold text-warning">{behavioralMetrics.suckerPayoffs}</div>
                      <div className="text-xs text-muted">Betrayed</div>
                    </div>
                    <div>
                      <div className="font-bold text-muted">{behavioralMetrics.mutualDefections}</div>
                      <div className="text-xs text-muted">Mutual Harm</div>
                    </div>
                  </div>
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
