'use client'

import { useEffect } from 'react'

interface AccountSaverProps {
  accountId: string
  accountName: string
}

export function AccountSaver({ accountId, accountName }: AccountSaverProps) {
  useEffect(() => {
    if (!accountId) return

    // 1. Save last accessed account ID and name
    localStorage.setItem('voxion_last_account_id', accountId)
    localStorage.setItem('voxion_last_account_name', accountName)

    // 2. Update the voxion_history list
    const historyStr = localStorage.getItem('voxion_history')
    let historyList = historyStr ? JSON.parse(historyStr) : []

    const newEntry = {
      account_id: accountId,
      name: accountName || accountId,
      accessed_at: new Date().toISOString()
    }

    // Filter duplicates, prepend new entry, limit to 10
    historyList = [newEntry, ...historyList.filter((a: { account_id: string }) => a.account_id !== accountId)].slice(0, 10)
    localStorage.setItem('voxion_history', JSON.stringify(historyList))

    // 3. Update voxion_recent_accounts (up to 3) for the search form chips
    const recentStr = localStorage.getItem('voxion_recent_accounts')
    let recentList = recentStr ? JSON.parse(recentStr) : []
    recentList = [newEntry, ...recentList.filter((a: { account_id: string }) => a.account_id !== accountId)].slice(0, 3)
    localStorage.setItem('voxion_recent_accounts', JSON.stringify(recentList))

    // 4. Dispatch change event to notify chips
    window.dispatchEvent(new Event('voxion_saved_accounts_changed'))
  }, [accountId, accountName])

  return null
}
