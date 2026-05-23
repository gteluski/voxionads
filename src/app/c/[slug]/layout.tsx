export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] selection:bg-[var(--primary)] selection:text-white">
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  )
}
