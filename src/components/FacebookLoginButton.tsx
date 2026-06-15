'use client'

import { useEffect } from 'react'
import { useMetaAuth } from '@/hooks/useMetaAuth'

export default function FacebookLoginButton() {
  const { checkLoginStatus, isLoggedIn, user, logout } = useMetaAuth()

  useEffect(() => {
    // Expor funções globalmente para o Facebook SDK
    if (typeof window !== 'undefined') {
      window.checkLoginState = checkLoginState
      window.statusChangeCallback = statusChangeCallback
    }
  }, [])

  const checkLoginState = () => {
    console.log('🔵 [LOGIN BUTTON] checkLoginState chamado')
    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) return
    
    fb.getLoginStatus((response: any) => {
      console.log('🔵 [LOGIN BUTTON] Response:', response)
      statusChangeCallback(response)
    })
  }

  const statusChangeCallback = (response: any) => {
    console.log('='.repeat(50))
    console.log('🔵 [FB LOGIN BUTTON] Response completo:')
    console.log({
      status: response.status,
      authResponse: response.authResponse ? {
        accessToken: response.authResponse.accessToken.substring(0, 20) + '...',
        userID: response.authResponse.userID,
        expiresIn: response.authResponse.expiresIn,
      } : null
    })
    console.log('='.repeat(50))

    if (response.status === 'connected') {
      console.log('🟢 [LOGIN BUTTON] ✓ Conectado!')
      
      // Salvar em localStorage
      localStorage.setItem(
        'fbLoginResponse',
        JSON.stringify(response.authResponse)
      )
      
      testAPI()
    } else if (response.status === 'not_authorized') {
      console.log('🔴 [LOGIN BUTTON] Não autorizado')
    } else {
      console.log('🔴 [LOGIN BUTTON] Não logado')
    }
    
    // Atualizar estado reativo da aplicação
    checkLoginStatus()
  }

  const testAPI = () => {
    console.log('🔵 [LOGIN BUTTON] Testando acesso à API...')
    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) return
    
    fb.api('/me', {fields: 'id,name,email'}, (response: any) => {
      if (response.error) {
        console.log('🔴 [LOGIN BUTTON] Erro na API:', response.error)
      } else {
        console.log('🟢 [LOGIN BUTTON] API OK:', response)
      }
    })
  }

  // Se já está logado, mostrar dados do perfil e logout
  if (isLoggedIn && user) {
    return (
      <div className="flex items-center justify-between gap-4 p-4 bg-[#1f1915] border border-[rgba(216,197,182,0.15)] rounded-xl w-full">
        <div className="flex items-center gap-3 min-w-0">
          {user?.picture?.data?.url ? (
            <img
              src={user.picture.data.url}
              alt={user.name}
              className="w-10 h-10 rounded-full border border-[#f18535] object-cover shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#f18535] text-[#31251f] font-black flex items-center justify-center text-sm shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#d8c5b6] truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={() => logout()}
          className="bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/20 hover:text-red-300 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0"
        >
          Sair
        </button>
      </div>
    )
  }

  // Mostrar botão de login do Facebook
  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Botão visual do Facebook SDK */}
      <div className="flex justify-center bg-white rounded-lg p-1 py-1.5 overflow-hidden">
        <fb:login-button 
          scope="public_profile,email,ads_management,business_management"
          onlogin="checkLoginState();"
          size="large"
          button_type="continue_with"
          show_faces="false"
          auto_logout_link="false"
        />
      </div>
      
      {/* Botão Customizado Voxion Ads */}
      <button
        onClick={checkLoginState}
        className="w-full bg-[#f18535] hover:bg-[#f5a35f] text-[#31251f] px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(241,133,53,0.2)]"
      >
        <span>🔵</span>
        Entrar com Facebook
      </button>
    </div>
  )
}
