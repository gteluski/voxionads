'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Clock, X } from 'lucide-react'

interface SavedAccount {
  account_id: string
  name: string
}

export function AdminSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [accountId, setAccountId] = useState('')
  const [recentAccounts, setRecentAccounts] = useState<SavedAccount[]>([])

  const loadRecentAccounts = () => {
    const historyStr = localStorage.getItem('voxion_history')
    const list = historyStr ? JSON.parse(historyStr) : []
    setRecentAccounts(list.slice(0, 3))
  }

  // 3. useEffect que ao montar lê localStorage e pré-preenche o campo
  useEffect(() => {
    const savedId = localStorage.getItem('voxion_last_account_id')
    const activeId = searchParams.get('account_id')
    
    Promise.resolve().then(() => {
      if (activeId) {
        setAccountId(activeId)
      } else if (savedId) {
        setAccountId(savedId)
      }
      loadRecentAccounts()
    })

    const handleUpdate = () => {
      loadRecentAccounts()
    }
    window.addEventListener('voxion_saved_accounts_changed', handleUpdate)
    return () => {
      window.removeEventListener('voxion_saved_accounts_changed', handleUpdate)
    }
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId.trim()) return

    router.push(`/dashboard?account_id=${accountId.trim()}`)
  }

  const handleChipClick = (accId: string) => {
    setAccountId(accId)
    router.push(`/dashboard?account_id=${accId}`)
  }

  const handleDeleteRecent = (accId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Remove from voxion_history in localStorage
    const historyStr = localStorage.getItem('voxion_history')
    let historyList = historyStr ? JSON.parse(historyStr) : []
    historyList = historyList.filter((a: { account_id: string }) => a.account_id !== accId)
    localStorage.setItem('voxion_history', JSON.stringify(historyList))

    // Update voxion_recent_accounts as well just in case
    localStorage.setItem('voxion_recent_accounts', JSON.stringify(historyList.slice(0, 3)))

    if (localStorage.getItem('voxion_last_account_id') === accId) {
      localStorage.removeItem('voxion_last_account_id')
    }

    setRecentAccounts(historyList.slice(0, 3))
    window.dispatchEvent(new Event('voxion_saved_accounts_changed'))
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSearch} className="flex gap-2 justify-end">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            placeholder="ID da Conta (ex: 123456)"
            className="appearance-none block w-full sm:w-64 px-3 py-2 pl-10 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={!accountId.trim()}
          className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary)] hover:bg-[#d6652c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--background)] disabled:opacity-50 transition-colors cursor-pointer"
        >
          Buscar
        </button>
      </form>

      {/* Recent Accounts Chips */}
      {recentAccounts.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end max-w-xl">
          {recentAccounts.map((acc) => (
            <div
              key={acc.account_id}
              onClick={() => handleChipClick(acc.account_id)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none group"
            >
              <Clock className="h-3 w-3 text-white/40 group-hover:text-[var(--primary)] transition-colors" />
              <span className="max-w-[120px] truncate">{acc.name || acc.account_id}</span>
              <button
                onClick={(e) => handleDeleteRecent(acc.account_id, e)}
                className="text-white/30 hover:text-red-400 p-0.5 rounded-full hover:bg-white/5 transition-all"
                title="Remover do histórico"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
