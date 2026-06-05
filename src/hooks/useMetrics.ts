'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
export function useMetrics(
  adminId?: string,
  campaignId?: string,
  dateRange?: { from: string; to: string }
) {
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!adminId) {
      setLoading(false)
      return
    }

    const fetchMetrics = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from('ads_metrics')
          .select('*')
          .eq('admin_id', adminId)

        if (campaignId) {
          query = query.eq('campaign_id', campaignId)
        }

        if (dateRange) {
          query = query
            .gte('date', dateRange.from)
            .lte('date', dateRange.to)
        }

        const { data, error } = await query.order('date', {
          ascending: false,
        })

        if (error) throw error
        setMetrics(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar métricas')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [adminId, campaignId, dateRange])

  return { metrics, loading, error }
}
