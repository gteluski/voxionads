'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { login } from './actions'
import { Lock, Mail } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--primary)] hover:bg-[#d6652c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--background)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  )
}

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function clientAction(formData: FormData) {
    const result = await login(formData)
    if (result?.error) {
      setErrorMessage('Credenciais inválidas.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[var(--secondary)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-md w-full space-y-8 bg-[var(--card)] p-10 rounded-2xl shadow-2xl border border-white/5 relative z-10 backdrop-blur-sm">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
            VOXION <span className="text-[var(--primary)]">Ads</span>
          </h2>
          <p className="mt-3 text-center text-sm text-[var(--text-secondary)]">
            Acesso exclusivo para gerenciamento de resultados.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action={clientAction}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--text-secondary)]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:z-10 sm:text-sm transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--text-secondary)]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2.5 pl-10 border border-white/10 bg-black/20 placeholder-[var(--text-secondary)] text-white rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] focus:z-10 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-md border border-red-400/20">
              {errorMessage}
            </div>
          )}

          <div>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  )
}
