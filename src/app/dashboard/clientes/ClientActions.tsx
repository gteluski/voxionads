'use client'

import { useState } from 'react'
import { deleteClient } from './actions'

export function ClientActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.')) return
    
    setLoading(true)
    try {
      await deleteClient(id)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors disabled:opacity-50"
    >
      {loading ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}

