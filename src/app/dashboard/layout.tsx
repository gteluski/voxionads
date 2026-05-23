import { Suspense } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { AccountPersistence } from '@/components/dashboard/AccountPersistence'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[var(--background)] overflow-hidden selection:bg-[var(--primary)] selection:text-white">
      <Suspense fallback={null}>
        <AccountPersistence />
      </Suspense>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
