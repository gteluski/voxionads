import { getClients } from './actions'
import { ClientForm } from './ClientForm'
import { ClientsTable } from '@/components/dashboard/ClientsTable'

export default async function ClientesPage() {
  const clients = await getClients()

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Gestão de Clientes</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Cadastre clientes e gere links únicos para acompanhamento.</p>
      </div>

      <ClientForm />

      <ClientsTable clients={clients || []} />
    </div>
  )
}

