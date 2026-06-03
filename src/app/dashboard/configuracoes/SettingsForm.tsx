'use client'

import { useState } from 'react'
import { Key, Bell, User, Check, AlertCircle } from 'lucide-react'
import { saveSettings } from './actions'

interface SettingsData {
  meta_access_token?: string
  alert_cpc?: number | string
  alert_cpm?: number | string
  alert_ctr?: number | string
  alert_frequency?: number | string
}

interface SettingsUser {
  email?: string | null
}

export function SettingsForm({ 
  initialSettings, 
  user 
}: { 
  initialSettings: SettingsData | null
  user?: SettingsUser | null 
}) {

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await saveSettings(formData)
      if (result.error) throw new Error(result.error)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao salvar configurações'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* API Key Section */}
      <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
          <Key className="h-5 w-5 text-[var(--primary)]" />
          Meta Ads API
        </h3>
        <div>
          <label htmlFor="meta_access_token" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Access Token (Opcional - Sobrepõe o .env)
          </label>
          <input
            type="password"
            name="meta_access_token"
            id="meta_access_token"
            defaultValue={initialSettings?.meta_access_token || ''}
            placeholder="EAA..."
            className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm transition-colors"
          />
          <p className="mt-2 text-xs text-[var(--text-secondary)]">Se preenchido, os dashboards de clientes usarão este token.</p>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
          <Bell className="h-5 w-5 text-[var(--primary)]" />
          Limites de Alertas
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="alert_cpc" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Alerta de CPC acima de (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="alert_cpc"
              id="alert_cpc"
              defaultValue={initialSettings?.alert_cpc || ''}
              placeholder="Ex: 2.00"
              className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm transition-colors"
            />
          </div>
          <div>
            <label htmlFor="alert_cpm" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Alerta de CPM acima de (R$)
            </label>
            <input
              type="number"
              step="0.01"
              name="alert_cpm"
              id="alert_cpm"
              defaultValue={initialSettings?.alert_cpm || ''}
              placeholder="Ex: 30.00"
              className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm transition-colors"
            />
          </div>
          <div>
            <label htmlFor="alert_ctr" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Alerta de CTR abaixo de (%)
            </label>
            <input
              type="number"
              step="0.01"
              name="alert_ctr"
              id="alert_ctr"
              defaultValue={initialSettings?.alert_ctr || ''}
              placeholder="Ex: 1.00"
              className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm transition-colors"
            />
          </div>
          <div>
            <label htmlFor="alert_frequency" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Alerta de Frequência acima de
            </label>
            <input
              type="number"
              step="0.1"
              name="alert_frequency"
              id="alert_frequency"
              defaultValue={initialSettings?.alert_frequency || ''}
              placeholder="Ex: 3.0"
              className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-4">
          <User className="h-5 w-5 text-[var(--primary)]" />
          Conta
        </h3>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            E-mail do Administrador
          </label>
          <input
            type="text"
            disabled
            value={user?.email || ''}
            className="appearance-none block w-full px-3 py-2 border border-white/5 bg-white/5 text-[var(--text-secondary)] rounded-md cursor-not-allowed sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
          {error && <p className="text-sm text-red-400 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}
          {success && <p className="text-sm text-green-400 flex items-center gap-1"><Check className="h-4 w-4" /> Configurações salvas!</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary)] hover:bg-[#d6652c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>

    </form>
  )
}
