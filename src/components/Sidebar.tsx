'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Clock, Settings, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Histórico', href: '/dashboard/historico', icon: Clock },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao deslogar:', error)
    }
  }


  const isProtectedAdminRoute = 
    pathname === '/dashboard' || 
    pathname.startsWith('/dashboard/clientes') || 
    pathname.startsWith('/dashboard/historico') || 
    pathname.startsWith('/dashboard/configuracoes')

  if (loading || !user || !isProtectedAdminRoute) {
    return null
  }

  return (
    <div className="flex flex-col w-64 bg-[var(--card)] border-r border-white/5 h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <h1 className="text-xl font-bold tracking-wider text-white">
          VOXION <span className="text-[var(--primary)]">Ads</span>
        </h1>
      </div>
      
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                  ${isActive 
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]' 
                    : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200
                    ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] group-hover:text-white'}
                  `}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 flex flex-col border-t border-white/5 p-4 space-y-4">
        <button
          onClick={handleLogout}
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-all duration-200 w-full"
        >
          <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-[var(--text-secondary)] group-hover:text-white transition-colors duration-200" />
          Sair
        </button>
        
        <div className="flex items-center justify-center pt-2">
          <span className="text-xs font-semibold text-white/30 tracking-widest">VOXION</span>
        </div>
      </div>
    </div>
  )
}
