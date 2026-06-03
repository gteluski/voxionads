import { getSettings } from './actions'
import { SettingsForm } from './SettingsForm'

export default async function ConfiguracoesPage() {
  const data = await getSettings()
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Configurações</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Gerencie a integração da API e os alertas de performance.</p>
      </div>

      <SettingsForm initialSettings={data?.settings || null} user={data?.user || null} />

    </div>
  )
}
