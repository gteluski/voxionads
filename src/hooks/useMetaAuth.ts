'use client'

import { useEffect, useState, useCallback } from 'react'

export interface FacebookUser {
  id: string
  name: string
  email?: string
  picture?: {
    data: {
      url: string
    }
  }
}

export function useMetaAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<FacebookUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)

  // 1. Verifica silenciosamente se já está logado
  const checkLoginStatus = useCallback(async () => {
    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) {
      setIsLoading(false)
      return
    }

    fb.getLoginStatus((response: any) => {
      setStatus(response.status);
      if (response.status === 'connected') {
        const { accessToken, userID, expiresIn: expIn } = response.authResponse;
        setIsLoggedIn(true);
        if (expIn) setExpiresIn(Number(expIn));
        
        // Busca perfil básico do usuário
        fb.api('/me', { fields: 'id,name,email,picture.type(large)' }, (userRes: any) => {
          if (!userRes.error) {
            setUser(userRes);
          }
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setExpiresIn(null);
      }
      setIsLoading(false);
    });
  }, []);

  // 2. Efeito para escutar o carregamento do SDK
  useEffect(() => {
    const checkSDK = setInterval(() => {
      const fb = typeof window !== 'undefined' ? (window as any).FB : null
      if (fb) {
        clearInterval(checkSDK);
        checkLoginStatus();
      }
    }, 300);

    return () => clearInterval(checkSDK);
  }, [checkLoginStatus]);

  // 3. Executa o login manual via botão customizado
  const handleMetaLogin = async () => {
    setIsLoading(true);
    setError(null);

    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) {
      setIsLoading(false);
      setError('O SDK da Meta não está disponível na página.');
      throw new Error('SDK não carregado.');
    }

    return new Promise<void>((resolve, reject) => {
      fb.login((response: any) => {
        setStatus(response.status);
        if (response.status === 'connected') {
          const { accessToken, userID, expiresIn: expIn } = response.authResponse;
          if (expIn) setExpiresIn(Number(expIn));
          
          console.log('🟢 [FB LOGIN] Login realizado com sucesso via SDK. userID:', userID);
          
          // Envia o token de forma segura para salvar no banco via API
          fetch('/api/meta/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken, userID }),
          })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar dados com o backend.');
            
            setIsLoggedIn(true);
            
            // Busca dados atualizados do usuário
            fb.api('/me', { fields: 'id,name,email,picture.type(large)' }, (userRes: any) => {
              if (!userRes.error) {
                setUser(userRes);
              }
            });

            setIsLoading(false);
            resolve();
          })
          .catch((err) => {
            console.error('🔴 [FB LOGIN] Erro ao salvar token:', err);
            setIsLoggedIn(false);
            setIsLoading(false);
            setError(err.message || 'Erro ao salvar credenciais.');
            reject(err);
          });

        } else if (response.status === 'not_authorized') {
          setIsLoading(false);
          setError('Aplicação não autorizada. Permissão negada pelo usuário.');
          reject(new Error('not_authorized'));
        } else {
          setIsLoading(false);
          setError('Conexão cancelada pelo usuário ou falhou.');
          reject(new Error('unknown'));
        }
      }, {
        scope: 'email,public_profile,ads_read,read_insights,pages_show_list,business_management'
      });
    });
  };

  const logout = async () => {
    const fb = typeof window !== 'undefined' ? (window as any).FB : null;
    if (!fb) return;

    return new Promise<void>((resolve) => {
      fb.logout(() => {
        setIsLoggedIn(false);
        setUser(null);
        setStatus(null);
        setExpiresIn(null);
        resolve();
      });
    });
  };

  return {
    isLoggedIn,
    isLoading,
    user,
    error,
    status,
    expiresIn,
    handleMetaLogin,
    loginWithFacebook: handleMetaLogin,
    logout
  };
}
