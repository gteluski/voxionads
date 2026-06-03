'use server'

import { adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'

export async function addClient(formData: FormData) {
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const meta_account_id = formData.get('meta_account_id') as string

  if (!name || !slug || !meta_account_id) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  try {
    const docRef = await adminDb.collection('clients').add({
      name,
      slug,
      meta_account_id,
      active: true,
      status: true,
      created_at: new Date().toISOString()
    })

    revalidatePath('/dashboard/clientes')
    return { 
      success: true, 
      data: { 
        id: docRef.id, 
        name, 
        slug, 
        meta_account_id,
        active: true,
        status: true
      } 
    }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function getClients() {
  try {
    const snapshot = await adminDb.collection('clients').orderBy('created_at', 'desc').get()
    const clients = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[]
    return clients
  } catch (error) {
    console.error('Error fetching clients from Firestore:', error)
    return []
  }
}

export async function deleteClient(id: string) {
  try {
    await adminDb.collection('clients').doc(id).delete()
    revalidatePath('/dashboard/clientes')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function toggleClientStatus(id: string, currentStatus: boolean) {
  try {
    await adminDb.collection('clients').doc(id).update({
      status: !currentStatus,
      active: !currentStatus
    })
    revalidatePath('/dashboard/clientes')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
