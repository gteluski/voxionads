'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Megaphone,
  Layers,
  ImagePlay,
  FileBarChart2,
  Settings,
  LogOut,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard',        label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/detalhes/campanha', label: 'Campanhas',     icon: Megaphone },
  { href: '/detalhes/conjuntos', label: 'Conjuntos',    icon: Layers },
  { href: '/detalhes/anuncio',  label: 'Anúncios',      icon: ImagePlay },
  { href: '/relatorios',        label: 'Relatórios',    icon: FileBarChart2 },
  { href: '/configuracoes',     label: 'Configurações', icon: Settings },
];

interface SidebarProps {
  onSync?: () => void;
  isSyncing?: boolean;
}

export function Sidebar({ onSync, isSyncing }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="vx-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
          style={{
            background: 'rgba(241,133,53,0.15)',
            border: '1.5px solid rgba(241,133,53,0.4)',
          }}
        >
          <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
            <path
              d="M4 4L8.5 15L10 10.5L11.5 15L16 4"
              stroke="#f18535"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <p className="font-black text-base leading-none" style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-heading)' }}>
            Voxion
          </p>
          <p className="text-[11px] font-semibold" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
            Ads Studio
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 mb-3" style={{ color: 'var(--color-accent-dim)' }}>
          Plataforma
        </p>
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={item.href} className={cn('vx-nav-item', isActive && 'active')}>
                <Icon size={16} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--color-primary)' }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}

        {/* Sync Button */}
        {onSync && (
          <div className="pt-3">
            <hr style={{ borderColor: 'var(--color-border)' }} className="mb-3" />
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="vx-nav-item w-full"
              style={{
                background: isSyncing ? 'rgba(241,133,53,0.08)' : undefined,
                color: 'var(--color-primary)',
                borderColor: isSyncing ? 'rgba(241,133,53,0.3)' : 'transparent',
              }}
            >
              <RefreshCw size={16} className={isSyncing ? 'vx-spin' : ''} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
              {!isSyncing && <Zap size={12} className="ml-auto opacity-60" />}
            </button>
          </div>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2" style={{ background: 'rgba(216,197,182,0.05)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
            style={{ background: 'var(--color-primary)', color: 'var(--color-text-dark)' }}
          >
            {session?.user?.name?.charAt(0) ?? session?.user?.email?.charAt(0) ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: 'var(--color-accent)' }}>
              {session?.user?.name ?? 'Admin'}
            </p>
            <p className="vx-mono truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/auth/login' })}
          className="vx-nav-item w-full text-red-400 hover:text-red-300"
          style={{ color: 'var(--color-danger)', borderColor: 'transparent' }}
        >
          <LogOut size={15} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
