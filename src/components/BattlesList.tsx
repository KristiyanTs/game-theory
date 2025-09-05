'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Match } from '@/lib/supabase'

const BATTLES_PER_PAGE = 60

export function BattlesList() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalMatches, setTotalMatches] = useState(0)

  useEffect(() => {
    fetchMatches(currentPage)
  }, [currentPage])

  const fetchMatches = async (page: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/matches?page=${page}&limit=${BATTLES_PER_PAGE}`)
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }
      const data = await response.json()
      setMatches(data.matches)
      setTotalPages(data.totalPages)
      setTotalMatches(data.total)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Unable to load battles')
    } finally {
      setLoading(false)
    }
  }

  const formatModelName = (name: string) => {
    const parts = name.split('/')
    return parts[parts.length - 1].toUpperCase().replace(/-/g, '-')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-error text-xl mb-4">{error}</p>
        <button 
          onClick={() => fetchMatches(currentPage)}
          className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-center space-y-6 py-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black gradient-text leading-none">
            ⚔️ ALL BATTLES
          </h1>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full"></div>
        </div>
        <p className="text-lg text-muted max-w-2xl">
          Complete history of AI warfare in the Prisoner's Dilemma arena
        </p>
        {totalMatches > 0 && (
          <div className="text-sm text-muted/80 font-mono">
            {((currentPage - 1) * BATTLES_PER_PAGE) + 1}-{Math.min(currentPage * BATTLES_PER_PAGE, totalMatches)} of {totalMatches.toLocaleString()} battles
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="flex justify-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center px-4 py-2 text-muted hover:text-accent transition-all duration-200 hover:bg-accent/5 rounded-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Matches List */}
      {matches.length === 0 ? (
        <div className="text-center py-20 space-y-6">
          <div className="text-6xl opacity-50">⚔️</div>
          <div className="space-y-2">
            <p className="text-xl text-muted">No battles have been fought yet.</p>
            <p className="text-sm text-muted">Be the first to start the AI warfare!</p>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-accent/25"
          >
            ⚔️ Start First Battle
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="space-y-3">
            {matches.map((match, index) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="block group"
              >
                <div className="relative overflow-hidden bg-gradient-to-r from-secondary/30 to-secondary/10 hover:from-secondary/50 hover:to-secondary/20 transition-all duration-300 rounded-xl border border-border/50 hover:border-accent/30 p-4">
                  <div className="flex items-center justify-between text-sm">
                    {/* Date */}
                    <div className="text-muted/70 font-mono text-xs w-24 flex-shrink-0">
                      {formatDate(match.created_at)}
                    </div>

                    {/* Models */}
                    <div className="flex items-center space-x-8 flex-1 justify-center">
                      <div className="text-center">
                        <div className={`font-mono font-bold flex items-center justify-center gap-2 text-base ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                          {match.winner_id === match.model_a_id && <span className="text-lg">🏆</span>}
                          {formatModelName(match.model_a?.name || '')}
                        </div>
                        <div className={`text-xl font-black mt-1 ${match.winner_id === match.model_a_id ? 'text-success' : 'text-foreground'}`}>
                          {match.model_a_final_score}
                        </div>
                      </div>

                      <div className="text-accent/60 font-bold text-lg">VS</div>

                      <div className="text-center">
                        <div className={`font-mono font-bold flex items-center justify-center gap-2 text-base ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                          {match.winner_id === match.model_b_id && <span className="text-lg">🏆</span>}
                          {formatModelName(match.model_b?.name || '')}
                        </div>
                        <div className={`text-xl font-black mt-1 ${match.winner_id === match.model_b_id ? 'text-success' : 'text-foreground'}`}>
                          {match.model_b_final_score}
                        </div>
                      </div>
                    </div>

                    {/* Battle Number */}
                    <div className="text-muted/50 font-mono text-xs w-16 text-right flex-shrink-0">
                      #{((currentPage - 1) * BATTLES_PER_PAGE) + index + 1}
                    </div>
                  </div>

                  {/* Subtle gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <div className="flex items-center space-x-2 bg-secondary/30 backdrop-blur-sm rounded-2xl p-2 border border-border/50">
            {/* Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 text-sm font-medium text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-xl hover:bg-accent/10"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Prev
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
              if (pageNum > totalPages) return null

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                    pageNum === currentPage
                      ? 'bg-accent text-white shadow-lg'
                      : 'text-muted hover:text-accent hover:bg-accent/10'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 text-sm font-medium text-muted hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-xl hover:bg-accent/10"
            >
              Next
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
