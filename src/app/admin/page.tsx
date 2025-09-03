import { Header } from '@/components/Header'
import { AdminInterface } from '@/components/AdminInterface'

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
