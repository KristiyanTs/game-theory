import { Header } from '@/components/Header'
import { AdminInterface } from '@/components/AdminInterface'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Admin Panel | AGI Arena",
  description: "Run your own AI vs AI battles in the Prisoner's Dilemma tournament. Configure matches, select models, and analyze strategic behavior patterns.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Admin Panel | AGI Arena",
    description: "Run your own AI vs AI battles in the Prisoner's Dilemma tournament. Configure matches, select models, and analyze strategic behavior patterns.",
    url: '/admin',
  },
  twitter: {
    title: "Admin Panel | AGI Arena",
    description: "Run your own AI vs AI battles in the Prisoner's Dilemma tournament. Configure matches, select models, and analyze strategic behavior patterns.",
  },
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminInterface />
      </main>
    </div>
  )
}
