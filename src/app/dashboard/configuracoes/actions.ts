'use server'

import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedUser() {
  const session = (await cookies()).get('session')?.value
  if (!session) return null

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(session, true)
    return decodedClaims
  } catch (error) {
    return null
  }
}

export async function getSettings() {
  const user = await getAuthenticatedUser()
  if (!user) return null

  try {
    const doc = await adminDb.collection('settings').doc(user.uid).get()
    const userSummary = { id: user.uid, email: user.email }
    
    if (!doc.exists) {
      return { settings: null, user: userSummary }
    }
    
    return { settings: { id: doc.id, ...doc.data() }, user: userSummary }
  } catch (error) {
    console.error('Error fetching settings from Firestore:', error)
    return { settings: null, user: user ? { id: user.uid, email: user.email } : null }
  }
}

export async function saveSettings(formData: FormData) {
  const user = await getAuthenticatedUser()
  if (!user) return { error: 'Não autorizado' }

  const meta_access_token = formData.get('meta_access_token') as string
  
  const alert_cpc_str = formData.get('alert_cpc') as string
  const alert_cpm_str = formData.get('alert_cpm') as string
  const alert_ctr_str = formData.get('alert_ctr') as string
  const alert_frequency_str = formData.get('alert_frequency') as string

  const settingsData = {
    user_id: user.uid,
    meta_access_token: meta_access_token || null,
    alert_cpc: alert_cpc_str ? parseFloat(alert_cpc_str) : null,
    alert_cpm: alert_cpm_str ? parseFloat(alert_cpm_str) : null,
    alert_ctr: alert_ctr_str ? parseFloat(alert_ctr_str) : null,
    alert_frequency: alert_frequency_str ? parseFloat(alert_frequency_str) : null,
    updated_at: new Date().toISOString()
  }

  try {
    await adminDb.collection('settings').doc(user.uid).set(settingsData, { merge: true })
    revalidatePath('/dashboard/configuracoes')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
