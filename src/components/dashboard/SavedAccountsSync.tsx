'use client'

import { useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'


interface AccountInfo {
  id: string
  name: string
  business_name: string
}

export function SavedAccountsSync({ account }: { account: AccountInfo }) {
  useEffect(() => {
    if (!account || !account.id) return

    const syncAccount = async () => {
      const now = Date.now()
      const accountId = account.id

      // 1. Save last accessed account to localStorage for auto-loading
      localStorage.setItem('voxion_last_account', accountId)
      localStorage.setItem('voxion_last_account_id', accountId)
      localStorage.setItem('voxion_last_account_name', account.name || account.business_name || accountId)

      // 2. Load and update saved accounts in localStorage
      const localStr = localStorage.getItem('voxion_saved_accounts')
      let savedList = localStr ? JSON.parse(localStr) : []

      const newEntry = {
        account_id: accountId,
        name: account.name || account.business_name || accountId,
        business_name: account.business_name || '',
        last_accessed: now
      }

      // Filter out duplicate and prepend new entry, limiting to 5
      savedList = [newEntry, ...savedList.filter((a: { account_id: string }) => a.account_id !== accountId)].slice(0, 5)
      localStorage.setItem('voxion_saved_accounts', JSON.stringify(savedList))

      // Update recent accounts list (up to 3 items) in localStorage['voxion_recent_accounts']
      const recentStr = localStorage.getItem('voxion_recent_accounts')
      let recentList = recentStr ? JSON.parse(recentStr) : []
      const newRecentEntry = {
        account_id: accountId,
        name: account.name || account.business_name || accountId
      }
      recentList = [newRecentEntry, ...recentList.filter((a: { account_id: string }) => a.account_id !== accountId)].slice(0, 3)
      localStorage.setItem('voxion_recent_accounts', JSON.stringify(recentList))

      // 3. Save to Firestore if authenticated
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        unsubscribe()
        if (user) {
          try {
            const docId = `${user.uid}_${accountId}`
            await setDoc(doc(db, 'saved_accounts', docId), {
              user_id: user.uid,
              account_id: accountId,
              account_name: account.name || account.business_name || accountId,
              business_name: account.business_name || '',
              last_accessed: new Date(now).toISOString()
            }, {
              merge: true
            })
          } catch (error) {
            console.error('Failed to sync saved account to Firestore:', error)
          }
        }
      })


      // 4. Notify other components that saved accounts changed
      window.dispatchEvent(new Event('voxion_saved_accounts_changed'))
    }

    syncAccount()
  }, [account])

  return null
}
