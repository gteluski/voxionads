'use client'

import { formatNumber } from '@/utils/formatters'

interface FunnelData {
  impressions: number
  reach: number
  clicks: number
  messages: number
}

export function TrafficFunnel({ data }: { data: FunnelData }) {
  // Prevent division by zero
  const rate1 = data.impressions > 0 ? ((data.reach / data.impressions) * 100).toFixed(1) : '0'
  const rate2 = data.reach > 0 ? ((data.clicks / data.reach) * 100).toFixed(1) : '0'
  const rate3 = data.clicks > 0 ? ((data.messages / data.clicks) * 100).toFixed(1) : '0'

  return (
    <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg h-full flex flex-col justify-between">
      <h3 className="text-lg font-medium text-white mb-6">Funil de Tráfego</h3>
      
      <div className="flex-1 flex items-center justify-center">
        <svg 
          viewBox="0 0 400 400" 
          className="w-full max-w-[340px] h-auto drop-shadow-[0_10px_20px_rgba(232,115,58,0.15)]"
        >
          <defs>
            <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8733A" />
              <stop offset="100%" stopColor="#C4956A" />
            </linearGradient>
          </defs>

          {/* Step 1: Impressões */}
          <polygon 
            points="10,10 390,10 340,80 60,80" 
            fill="url(#funnelGrad)" 
            opacity="1.0"
          />
          <text x="200" y="38" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="15">
            {formatNumber(data.impressions)}
          </text>
          <text x="200" y="58" textAnchor="middle" fill="#ffffff" fontWeight="medium" fontSize="11" opacity="0.85">
            Impressões
          </text>

          {/* Rate 1 (Impressões -> Alcance) */}
          <line x1="200" y1="80" x2="200" y2="110" stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
          <rect x="170" y="87" width="60" height="16" rx="8" fill="#1a1410" stroke="rgba(255,255,255,0.1)" />
          <text x="200" y="99" textAnchor="middle" fill="#E8733A" fontWeight="bold" fontSize="10">
            {rate1}%
          </text>

          {/* Step 2: Alcance */}
          <polygon 
            points="65,110 335,110 285,180 115,180" 
            fill="url(#funnelGrad)" 
            opacity="0.9"
          />
          <text x="200" y="138" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="15">
            {formatNumber(data.reach)}
          </text>
          <text x="200" y="158" textAnchor="middle" fill="#ffffff" fontWeight="medium" fontSize="11" opacity="0.85">
            Alcance
          </text>

          {/* Rate 2 (Alcance -> Cliques) */}
          <line x1="200" y1="180" x2="200" y2="210" stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
          <rect x="170" y="187" width="60" height="16" rx="8" fill="#1a1410" stroke="rgba(255,255,255,0.1)" />
          <text x="200" y="199" textAnchor="middle" fill="#E8733A" fontWeight="bold" fontSize="10">
            {rate2}%
          </text>

          {/* Step 3: Cliques */}
          <polygon 
            points="120,210 280,210 230,280 170,280" 
            fill="url(#funnelGrad)" 
            opacity="0.8"
          />
          <text x="200" y="238" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="15">
            {formatNumber(data.clicks)}
          </text>
          <text x="200" y="258" textAnchor="middle" fill="#ffffff" fontWeight="medium" fontSize="11" opacity="0.85">
            Cliques
          </text>

          {/* Rate 3 (Cliques -> Mensagens) */}
          <line x1="200" y1="280" x2="200" y2="310" stroke="rgba(255,255,255,0.15)" strokeDasharray="3,3" />
          <rect x="170" y="287" width="60" height="16" rx="8" fill="#1a1410" stroke="rgba(255,255,255,0.1)" />
          <text x="200" y="299" textAnchor="middle" fill="#E8733A" fontWeight="bold" fontSize="10">
            {rate3}%
          </text>

          {/* Step 4: Mensagens */}
          <polygon 
            points="175,310 225,310 215,380 185,380" 
            fill="url(#funnelGrad)" 
            opacity="0.7"
          />
          <text x="200" y="338" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="15">
            {formatNumber(data.messages)}
          </text>
          <text x="200" y="358" textAnchor="middle" fill="#ffffff" fontWeight="medium" fontSize="11" opacity="0.85">
            Mensagens
          </text>
        </svg>
      </div>
    </div>
  )
}

