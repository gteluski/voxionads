'use client'

import { useMetaAuth } from '@/hooks/useMetaAuth'

export default function MetaAuthPage() {
  const {
    isLoggedIn,
    isLoading,
    user,
    status,
    expiresIn,
    loginWithFacebook,
    logout
  } = useMetaAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#31251f]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f18535] mx-auto mb-4"></div>
          <p className="text-[#d8c5b6]">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // CASO 1: Conectado
  if (isLoggedIn && status === 'connected') {
    return (
      <div className="min-h-screen bg-[#31251f] p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-[#1f1915] border border-green-500 p-8 rounded-2xl shadow-xl space-y-6">
            <h1 className="text-3xl font-black text-green-400 mb-2 font-['Nunito']">
              ✅ Conectado com Sucesso!
            </h1>
            
            <div className="flex items-center gap-6 p-4 bg-[#31251f]/50 border border-[rgba(216,197,182,0.1)] rounded-xl">
              {user?.picture?.data?.url && (
                <img
                  src={user.picture.data.url}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-2 border-[#f18535] object-cover"
                />
              )}
              <div className="space-y-1.5 text-[#d8c5b6] min-w-0">
                <p className="text-xl font-bold font-['Nunito'] truncate">{user?.name}</p>
                <p className="text-sm opacity-80 truncate">{user?.email}</p>
                <p className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 font-bold border border-green-500/20 rounded-md w-fit">
                  Status: {status}
                </p>
              </div>
            </div>

            <div className="text-[#d8c5b6] text-xs font-mono bg-[#31251f]/35 p-4 rounded-lg space-y-2">
              <p><strong>Meta User ID:</strong> {user?.id}</p>
              {expiresIn && (
                <p><strong>Expiração do Token:</strong> {expiresIn} segundos (~{Math.round(expiresIn / 3600)}h)</p>
              )}
            </div>
            
            <button
              onClick={() => logout()}
              className="w-full bg-red-950/35 border border-red-900/30 text-red-400 hover:bg-red-900/30 hover:text-red-300 font-bold py-3.5 rounded-xl transition-all shadow-md"
            >
              Desconectar Conta Facebook
            </button>
          </div>
        </div>
      </div>
    )
  }

  // CASO 2: Não autorizado
  if (status === 'not_authorized') {
    return (
      <div className="min-h-screen bg-[#31251f] flex items-center justify-center p-8">
        <div className="bg-[#1f1915] border border-yellow-500 p-8 rounded-2xl shadow-xl max-w-md text-center space-y-6">
          <h1 className="text-3xl font-black text-yellow-400 font-['Nunito']">
            ⚠️ Autorização Necessária
          </h1>
          <p className="text-[#d8c5b6] text-sm leading-relaxed">
            Você está autenticado no Facebook, mas não concedeu as permissões necessárias para o Voxion Ads gerenciar seus ativos de tráfego.
          </p>
          <button
            onClick={() => loginWithFacebook()}
            className="w-full bg-[#f18535] text-[#31251f] font-bold py-3.5 rounded-xl transition-all hover:bg-[#f5a35f] shadow-[0_4px_14px_rgba(241,133,53,0.3)]"
          >
            Autorizar Aplicativo
          </button>
        </div>
      </div>
    )
  }

  // CASO 3: Não logado
  return (
    <div className="min-h-screen bg-[#31251f] flex items-center justify-center p-8">
      <div className="bg-[#1f1915] border border-red-500/40 p-8 rounded-2xl shadow-xl max-w-md text-center space-y-6">
        <h1 className="text-3xl font-black text-red-400 font-['Nunito']">
          🔴 Faça Login com o Facebook
        </h1>
        <p className="text-[#d8c5b6] text-sm leading-relaxed">
          Para acessar dados e gerenciar suas campanhas de anúncios, você precisa autorizar a integração do Voxion Ads com sua conta.
        </p>
        <button
          onClick={() => loginWithFacebook()}
          className="w-full bg-[#f18535] text-[#31251f] font-bold py-3.5 rounded-xl transition-all hover:bg-[#f5a35f] shadow-[0_4px_14px_rgba(241,133,53,0.3)]"
        >
          Entrar com o Facebook
        </button>
      </div>
    </div>
  )
}
