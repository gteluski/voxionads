'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { addClient } from './actions'

export function ClientForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [metaAccountId, setMetaAccountId] = useState('')

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    // Auto generate slug
    setSlug(
      newName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('meta_account_id', metaAccountId)

    try {
      const result = await addClient(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setName('')
        setSlug('')
        setMetaAccountId('')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro ao salvar o cliente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg mb-8">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <Plus className="h-5 w-5 text-[var(--primary)]" />
        Cadastrar Novo Cliente
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Nome do Cliente
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={name}
              onChange={handleNameChange}
              placeholder="Ex: ACME Corp"
              className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm transition-colors"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Slug (URL única)
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Ex: acme-corp"
              className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm transition-colors"
            />
          </div>
          <div>
            <label htmlFor="meta_account_id" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Meta Account ID
            </label>
            <input
              type="text"
              name="meta_account_id"
              id="meta_account_id"
              required
              value={metaAccountId}
              onChange={(e) => setMetaAccountId(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 375948289152564"
              className="appearance-none block w-full px-3 py-2 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm transition-colors"
            />
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">
              O Account ID é o número da sua conta no Gerenciador de Anúncios da Meta. Ex: 375948289152564
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        {success && <p className="text-sm text-green-400 mt-2 flex items-center gap-1"><Check className="h-4 w-4" /> Cliente cadastrado com sucesso!</p>}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary)] hover:bg-[#d6652c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--background)] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Salvar Cliente'}
          </button>
        </div>
      </form>
    </div>
  )
}
