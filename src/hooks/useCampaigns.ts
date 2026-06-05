'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
export function useCampaigns(adminId?: string) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!adminId) {
      setLoading(false)
      return
    }

    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('campaigns')
          .select('*')
          .eq('admin_id', adminId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setCampaigns(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar campanhas')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()

    const subscription = supabase
      .channel('campaigns-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaigns' }, (payload) => {
        console.log('Real-time update:', payload)
        fetchCampaigns()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId])

  return { campaigns, loading, error }
}
