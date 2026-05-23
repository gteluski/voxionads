'use client'

import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/formatters'

interface AIInsightsProps {
  summary: {
    spend: number
    reach: number
    ctr: number
    cpc: number
    messages: number
    frequency: number
    cpm: number
  }
}

export function AIInsights({ summary }: AIInsightsProps) {
  const { spend, reach, ctr, cpc, messages, frequency, cpm } = summary
  
  const tips = []
  
  if (cpc > 2) {
    tips.push({ text: "CPC elevado — considere revisar o criativo ou a segmentação do público.", type: 'warning' })
  }
  if (ctr < 1 && ctr > 0) {
    tips.push({ text: "CTR baixo — teste novos criativos, imagens ou copies para chamar mais atenção.", type: 'warning' })
  }
  if (frequency > 3) {
    tips.push({ text: "Frequência alta — o público pode estar saturado, considere expandir a segmentação.", type: 'alert' })
  }
  if (cpm > 30) {
    tips.push({ text: "CPM alto — tente segmentações mais amplas para baratear o leilão.", type: 'warning' })
  }
  
  if (tips.length === 0 && spend > 0) {
    tips.push({ text: "Sua campanha está performando bem em relação aos KPIs padrão! Continue monitorando.", type: 'success' })
  } else if (spend === 0) {
    tips.push({ text: "Não há investimento no período selecionado.", type: 'neutral' })
  }

  const overallStatus = tips.some(t => t.type === 'alert') 
    ? 'Crítico' 
    : tips.some(t => t.type === 'warning') 
      ? 'Atenção' 
      : 'Saudável'

  return (
    <div className="bg-gradient-to-br from-[var(--card)] to-black/40 rounded-xl border border-white/5 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-400" />
          Análise Inteligente da Campanha
        </h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
          overallStatus === 'Crítico' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
          overallStatus === 'Atenção' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
          'bg-green-500/10 text-green-400 border-green-500/20'
        }`}>
          Status: {overallStatus}
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Sua campanha atingiu <strong className="text-white">{formatNumber(reach)}</strong> pessoas únicas, 
          com uma taxa de cliques (CTR) de <strong className="text-white">{formatPercent(ctr)}</strong> e 
          custo por clique de <strong className="text-white">{formatCurrency(cpc)}</strong>. 
          O investimento total de <strong className="text-white">{formatCurrency(spend)}</strong> gerou 
          <strong className="text-white ml-1">{formatNumber(messages)}</strong> mensagens iniciadas.
        </p>

        <div className="pt-4 border-t border-white/5">
          <h4 className="text-xs font-medium text-white uppercase tracking-wider mb-3">Dicas de Otimização</h4>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {tip.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />}
                {tip.type === 'alert' && <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />}
                {tip.type === 'success' && <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />}
                {tip.type === 'neutral' && <TrendingUp className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />}
                <span className="text-[var(--text-secondary)]">{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
