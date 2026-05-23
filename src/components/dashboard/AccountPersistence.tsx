'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function AccountPersistence() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect if on the dashboard page
    if (pathname !== '/dashboard') return

    const activeParam = searchParams.get('account_id')
    const savedId = localStorage.getItem('voxion_last_account_id')

    if (savedId && !activeParam) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('account_id', savedId)
      router.push(`${pathname}?${params.toString()}`)
    }
  }, [searchParams, pathname, router])

  return null
}
