'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error fetching settings:', error)
  }

  return { settings: data, user }
}

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const meta_access_token = formData.get('meta_access_token') as string
  
  const alert_cpc_str = formData.get('alert_cpc') as string
  const alert_cpm_str = formData.get('alert_cpm') as string
  const alert_ctr_str = formData.get('alert_ctr') as string
  const alert_frequency_str = formData.get('alert_frequency') as string

  const settingsData = {
    user_id: user.id,
    meta_access_token: meta_access_token || null,
    alert_cpc: alert_cpc_str ? parseFloat(alert_cpc_str) : null,
    alert_cpm: alert_cpm_str ? parseFloat(alert_cpm_str) : null,
    alert_ctr: alert_ctr_str ? parseFloat(alert_ctr_str) : null,
    alert_frequency: alert_frequency_str ? parseFloat(alert_frequency_str) : null,
    updated_at: new Date().toISOString()
  }

  // Upsert settings
  const { error } = await supabase
    .from('settings')
    .upsert(settingsData, { onConflict: 'user_id' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/configuracoes')
  return { success: true }
}
