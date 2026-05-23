'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addClient(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const meta_account_id = formData.get('meta_account_id') as string

  if (!name || !slug || !meta_account_id) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([{ 
      name, 
      slug, 
      meta_account_id,
      active: true
    }])
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/clientes')
  return { success: true, data }
}

export async function getClients() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data
}

export async function deleteClient(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/clientes')
  return { success: true }
}

export async function toggleClientStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update({ status: !currentStatus })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/clientes')
  return { success: true }
}
