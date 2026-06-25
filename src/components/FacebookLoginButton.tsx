'use client'

import { createClient } from '@/utils/supabase/client'

export default function FacebookLoginButton() {
  const supabase = createClient()

  const handleFacebookLogin = async () => {
    console.log('🔵 [FB LOGIN] Iniciando autenticação Meta com Supabase Auth...')
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          scopes: 'email,public_profile,ads_read,ads_management,business_management,read_insights',
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        console.error('🔴 [FB LOGIN] Erro no Supabase Signin:', error.message)
      }
    } catch (err) {
      console.error('🔴 [FB LOGIN] Erro inesperado ao autenticar:', err)
    }
  }

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Botão Customizado Voxion Ads */}
      <button
        type="button"
        onClick={handleFacebookLogin}
        className="w-full bg-[#f18535] hover:bg-[#f5a35f] text-[#31251f] px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(241,133,53,0.2)]"
      >
        <svg className="w-5 h-5 fill-[#31251f]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Entrar com Facebook
      </button>
    </div>
  )
}
