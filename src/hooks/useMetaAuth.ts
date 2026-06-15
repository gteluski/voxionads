'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { FacebookLoginStatus, FacebookUser } from '@/types/facebook'

export function useMetaAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<FacebookUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [userID, setUserID] = useState<string | null>(null)
  const [status, setStatus] = useState<'connected' | 'not_authorized' | 'unknown'>('unknown')
  const router = useRouter()

  const fetchUserData = useCallback((token: string) => {
    console.log('🔵 [AUTH] Buscando dados do usuário...')
    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) return

    fb.api('/me', {
      fields: 'id,name,email,picture.type(large)',
      access_token: token
    }, (userResponse: any) => {
      if (userResponse.error) {
        console.log('🔴 [AUTH] Erro ao buscar usuário:', userResponse.error)
        return
      }
      
      console.log('🟢 [AUTH] Usuário encontrado:', {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email
      })
      
      setUser(userResponse)
      localStorage.setItem('metaUser', JSON.stringify(userResponse))
    })
  }, [])

  const checkLoginStatus = useCallback(async () => {
    console.log('🔵 [AUTH] Verificando status de login...')
    setIsLoading(true)

    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) {
      console.log('⚠️ [AUTH] Facebook SDK não carregado.')
      setIsLoading(false)
      return
    }

    try {
      fb.getLoginStatus((response: FacebookLoginStatus) => {
        console.log('🔵 [AUTH] Response completo:', response)
        
        setStatus(response.status)

        // CASO 1: CONNECTED - Usuário logado e autorizado
        if (response.status === 'connected') {
          console.log('🟢 [AUTH] Status: CONNECTED (logado e autorizado)')
          
          const authResponse = response.authResponse
          
          if (authResponse) {
            const token = authResponse.accessToken
            const expiration = authResponse.expiresIn
            const userId = authResponse.userID
            const signedRequest = authResponse.signedRequest
            
            console.log('🟢 [AUTH] AccessToken:', token.substring(0, 20) + '...')
            console.log('🟢 [AUTH] UserID:', userId)
            console.log('🟢 [AUTH] ExpiresIn:', expiration, 'segundos')
            console.log('🟢 [AUTH] SignedRequest:', signedRequest ? 'presente' : 'não presente')
            
            // Salvar valores
            setAccessToken(token)
            setUserID(userId)
            setExpiresIn(expiration)
            
            // Armazenar em localStorage
            localStorage.setItem('metaAccessToken', token)
            localStorage.setItem('metaUserID', userId)
            localStorage.setItem('metaTokenExpiration', 
              (Date.now() + expiration * 1000).toString())
            
            // Buscar dados do usuário
            fetchUserData(token)
            
            setIsLoggedIn(true)
          }
        }
        
        // CASO 2: NOT_AUTHORIZED - Logado no FB, mas não no app
        else if (response.status === 'not_authorized') {
          console.log('🔴 [AUTH] Status: NOT_AUTHORIZED')
          console.log('🔴 [AUTH] Usuário logado no Facebook, mas não autorizou a app')
          
          setIsLoggedIn(false)
          setStatus('not_authorized')
        }
        
        // CASO 3: UNKNOWN - Não logado no FB ou logout foi feito
        else {
          console.log('🔴 [AUTH] Status: UNKNOWN')
          console.log('🔴 [AUTH] Usuário não logado no Facebook ou logout foi feito')
          
          setIsLoggedIn(false)
          setAccessToken(null)
          setUserID(null)
          setExpiresIn(null)
          setUser(null)
          
          // Limpar localStorage
          localStorage.removeItem('metaAccessToken')
          localStorage.removeItem('metaUserID')
          localStorage.removeItem('metaTokenExpiration')
        }
        
        setIsLoading(false)
      })
    } catch (error) {
      console.log('🔴 [AUTH] Erro ao verificar status:', error)
      setIsLoading(false)
    }
  }, [fetchUserData])

  useEffect(() => {
    // Tenta inicializar ou escutar se o SDK já foi carregado
    const checkSDKInterval = setInterval(() => {
      const fb = typeof window !== 'undefined' ? (window as any).FB : null
      if (fb) {
        clearInterval(checkSDKInterval)
        checkLoginStatus()
      }
    }, 500)

    return () => clearInterval(checkSDKInterval)
  }, [checkLoginStatus])

  useEffect(() => {
    if (!expiresIn) return

    const expirationTime = Date.now() + expiresIn * 1000
    console.log('🔵 [AUTH] Token expira em:', new Date(expirationTime).toLocaleString())
    
    // Verificar a cada minuto se token expirou
    const checkInterval = setInterval(() => {
      const now = Date.now()
      const timeRemaining = expirationTime - now
      
      if (timeRemaining <= 0) {
        console.log('🔴 [AUTH] Token expirou!')
        clearInterval(checkInterval)
        checkLoginStatus() // Fazer refresh automático
      } else if (timeRemaining < 300000) { // 5 minutos
        console.log('⚠️ [AUTH] Token expira em menos de 5 minutos')
      }
    }, 60000) // Verificar a cada minuto

    return () => clearInterval(checkInterval)
  }, [expiresIn, checkLoginStatus])

  const loginWithFacebook = async (
    scope: string = 'public_profile,email'
  ) => {
    console.log('🔵 [AUTH] Iniciando login...')
    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) {
      return Promise.reject(new Error('Facebook SDK não carregado'))
    }
    
    return new Promise((resolve, reject) => {
      fb.login((response: FacebookLoginStatus) => {
        console.log('🔵 [AUTH] Response login:', response)
        
        if (response.authResponse) {
          console.log('🟢 [AUTH] Login bem-sucedido!')
          checkLoginStatus()
          resolve(response.authResponse)
        } else {
          console.log('🔴 [AUTH] Login cancelado pelo usuário')
          reject(new Error('Login cancelado'))
        }
      }, { scope })
    })
  }

  const logout = async () => {
    console.log('🔵 [AUTH] Fazendo logout...')
    const fb = typeof window !== 'undefined' ? (window as any).FB : null
    if (!fb) return

    return new Promise<void>((resolve) => {
      fb.logout((response: any) => {
        console.log('🟢 [AUTH] Logout bem-sucedido', response)
        
        setIsLoggedIn(false)
        setUser(null)
        setAccessToken(null)
        setUserID(null)
        setExpiresIn(null)
        setStatus('unknown')
        
        localStorage.removeItem('metaAccessToken')
        localStorage.removeItem('metaUserID')
        localStorage.removeItem('metaTokenExpiration')
        localStorage.removeItem('metaUser')
        
        resolve()
      })
    })
  }

  const isTokenExpired = (): boolean => {
    if (!expiresIn) return true
    
    const tokenExpiration = localStorage.getItem('metaTokenExpiration')
    if (!tokenExpiration) return true
    
    return Date.now() > parseInt(tokenExpiration)
  }

  const getTokenRemainingTime = (): number => {
    const tokenExpiration = localStorage.getItem('metaTokenExpiration')
    if (!tokenExpiration) return 0
    
    const remaining = parseInt(tokenExpiration) - Date.now()
    return Math.max(0, remaining)
  }

  return {
    // Estados
    isLoggedIn,
    isLoading,
    user,
    accessToken,
    userID,
    expiresIn,
    status,
    
    // Métodos
    checkLoginStatus,
    loginWithFacebook,
    logout,
    isTokenExpired,
    getTokenRemainingTime,
  }
}
