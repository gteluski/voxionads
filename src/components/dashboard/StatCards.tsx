'use client'

import { useState } from 'react'
import {
  HelpCircle,
  DollarSign,
  Users,
  Layers,
  Activity,
  MousePointerClick,
  MessageCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react'

interface Stat {
  name: string
  value: string
  tooltip: string
}

function getIconComponent(name: string) {
  switch (name) {
    case 'Investimento Total':
      return DollarSign
    case 'Alcance':
      return Users
    case 'Impressões':
      return Layers
    case 'Frequência':
      return Activity
    case 'Cliques (Todos)':
      return MousePointerClick
    case 'Mensagens Iniciadas':
      return MessageCircle
    case 'Custo por Clique (CPC)':
      return TrendingUp
    case 'Custo por Mensagem':
      return BarChart3
    case 'CPM':
      return Activity
    case 'CTR':
      return TrendingUp
    default:
      return Activity
  }
}

export function StatCards({ stats }: { stats: Stat[] }) {
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    text: string
    x: number
    y: number
  } | null>(null)

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((item) => {
        const IconComponent = getIconComponent(item.name)
        return (
          <div
            key={item.name}
            className="relative bg-[var(--card)] pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow-lg rounded-xl overflow-hidden border border-white/5 transition-all duration-200 hover:border-white/10 hover:shadow-[var(--primary)]/5 group"
          >
            <dt>
              <div className="absolute bg-[var(--primary)]/10 rounded-lg p-3 group-hover:bg-[var(--primary)]/20 transition-colors">
                <IconComponent className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
              </div>
              <div className="ml-16 flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--text-secondary)] truncate">{item.name}</p>
                <div className="flex items-center">
                  <HelpCircle 
                    className="h-3.5 w-3.5 text-[var(--text-secondary)] cursor-help hover:text-white transition-colors" 
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setHoveredTooltip({
                        text: item.tooltip,
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8
                      })
                    }}
                    onMouseLeave={() => setHoveredTooltip(null)}
                  />
                </div>
              </div>
            </dt>
            <dd className="ml-16 flex items-baseline mt-1">
              <p className="text-2xl font-semibold text-white">
                {item.value}
              </p>
            </dd>
          </div>
        )
      })}

      {/* Portal-like Tooltip using fixed positioning */}
      {hoveredTooltip && (
        <div 
          style={{
            position: 'fixed',
            top: `${hoveredTooltip.y}px`,
            left: `${hoveredTooltip.x}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 9999,
            pointerEvents: 'none',
            backgroundColor: '#1a1410',
            color: '#ffffff',
            padding: '8px 12px',
            borderRadius: '8px',
            maxWidth: '250px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.5)'
          }}
          className="text-xs text-center font-normal leading-normal"
        >
          {hoveredTooltip.text}
          {/* Arrow */}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-4 border-transparent border-t-[#1a1410]" 
          />
        </div>
      )}
    </div>
  )
}


