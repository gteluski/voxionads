'use client'

import { useState } from 'react'
import { ExternalLink, Info } from 'lucide-react'
import { CopyLinkButton } from '@/app/dashboard/clientes/CopyLinkButton'
import { ClientActions } from '@/app/dashboard/clientes/ClientActions'
import { ClientMiniReportDrawer } from './ClientMiniReportDrawer'

interface ClientItem {
  id: string
  name: string
  slug: string
  meta_account_id: string
}

interface ClientsTableProps {
  clients: ClientItem[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null)

  return (
    <>
      <div className="bg-[var(--card)] rounded-xl border border-white/5 shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-white">Clientes Cadastrados</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
              Clique no nome de um cliente para abrir o relatório rápido lateral.
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-[var(--text-secondary)] self-start sm:self-auto">
            {clients?.length || 0} total
          </span>
        </div>
        
        {(!clients || clients.length === 0) ? (
          <div className="p-12 text-center text-[var(--text-secondary)]">
            Nenhum cliente cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-black/20">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Account ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Link do cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.02] transition-colors group/row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-left font-medium text-white hover:text-[var(--primary)] hover:underline transition-all cursor-pointer focus:outline-none"
                        title="Ver relatório rápido"
                      >
                        {client.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] font-mono">
                      {client.meta_account_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a 
                        href={`/c/${client.slug}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[var(--primary)] hover:underline font-mono"
                      >
                        /c/{client.slug}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex items-center justify-end gap-3">
                        <CopyLinkButton slug={client.slug} />
                        <a 
                          href={`/c/${client.slug}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-white bg-white/5 hover:bg-white/10 transition-colors"
                          title="Ver Dashboard"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Ver Dashboard
                        </a>
                        <ClientActions id={client.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ClientMiniReportDrawer 
        client={selectedClient} 
        onClose={() => setSelectedClient(null)} 
      />
    </>
  )
}
