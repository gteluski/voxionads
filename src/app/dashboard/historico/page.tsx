'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Trash2, ExternalLink, Inbox } from 'lucide-react'

interface HistoryAccount {
  account_id: string
  name: string
  accessed_at: string
}

export default function HistoricoPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<HistoryAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadSavedAccounts = () => {
    setIsLoading(true)
    
    // 1. Get from localStorage voxion_history
    const historyStr = localStorage.getItem('voxion_history')
    const list: HistoryAccount[] = historyStr ? JSON.parse(historyStr) : []

    // Sort by accessed_at descending
    list.sort((a, b) => new Date(b.accessed_at).getTime() - new Date(a.accessed_at).getTime())

    setAccounts(list)
    setIsLoading(false)
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      loadSavedAccounts()
    })
    
    // Listen for changes (e.g. from the AdminSearchForm component in the header)
    window.addEventListener('voxion_saved_accounts_changed', loadSavedAccounts)
    return () => {
      window.removeEventListener('voxion_saved_accounts_changed', loadSavedAccounts)
    }
  }, [])

  const handleDelete = (accId: string) => {
    // 1. Remove from localStorage saved list
    const historyStr = localStorage.getItem('voxion_history')
    if (historyStr) {
      const list = JSON.parse(historyStr).filter((a: HistoryAccount) => a.account_id !== accId)
      localStorage.setItem('voxion_history', JSON.stringify(list))
      
      // Also update voxion_recent_accounts
      localStorage.setItem('voxion_recent_accounts', JSON.stringify(list.slice(0, 3)))
    }
    
    // 2. Remove from last account if matching
    if (localStorage.getItem('voxion_last_account_id') === accId) {
      localStorage.removeItem('voxion_last_account_id')
    }

    // 3. Trigger global change event to sync other headers/components
    window.dispatchEvent(new Event('voxion_saved_accounts_changed'))
    
    // 4. Update local state
    setAccounts(prev => prev.filter(a => a.account_id !== accId))
  }

  const handleOpenDashboard = (accId: string) => {
    // Update active account in localStorage
    localStorage.setItem('voxion_last_account_id', accId)
    // Redirect to dashboard page with the search query param
    router.push(`/dashboard?account_id=${accId}`)
  }

  const formatDate = (val: string) => {
    const date = new Date(val)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Histórico de Contas</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Acesse rapidamente ou remova as contas de anúncios gerenciadas recentemente.
        </p>
      </div>

      <div className="bg-[var(--card)] rounded-xl border border-white/5 shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--primary)]" />
            Contas Acessadas Recentemente
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-[var(--text-secondary)]">
            {accounts.length} no histórico
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 space-y-4">
            <div className="h-6 bg-white/5 rounded w-1/3 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-10 bg-white/5 rounded animate-pulse"></div>
              <div className="h-10 bg-white/5 rounded animate-pulse"></div>
              <div className="h-10 bg-white/5 rounded animate-pulse"></div>
            </div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <Inbox className="h-12 w-12 text-white/10 mb-4 animate-bounce duration-1000" />
            <p className="text-base font-medium text-white/70">Nenhuma conta acessada ainda.</p>
            <p className="text-xs mt-1 text-white/40">Busque uma conta de anúncios no dashboard para salvá-la aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-black/20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Account ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Último acesso formatado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accounts.map((acc) => (
                  <tr key={acc.account_id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {acc.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] font-mono">
                      {acc.account_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {formatDate(acc.accessed_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleOpenDashboard(acc.account_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-white bg-[var(--primary)] hover:bg-[#d6652c] transition-colors cursor-pointer"
                          title="Abrir Dashboard"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Abrir
                        </button>
                        <button
                          onClick={() => handleDelete(acc.account_id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-[var(--text-secondary)] hover:text-red-400 bg-white/5 hover:bg-red-400/10 border border-white/5 hover:border-red-400/20 transition-colors cursor-pointer"
                          title="Remover do Histórico"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
