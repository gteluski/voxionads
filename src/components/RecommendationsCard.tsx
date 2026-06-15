export default function RecommendationsCard() {
  const recommendations = [
    {
      id: 1,
      type: 'campaign', // 'campaign' ou 'ad'
      title: 'Aumentar Budget da Campanha "Promoção Verão"',
      description: 'ROI está 35% acima da média. Recomendamos aumentar budget em 20%.',
      impact: '+R$ 2.500/mês',
      severity: 'success', // 'success', 'warning', 'error'
      action: 'Ver Detalhes',
    },
    {
      id: 2,
      type: 'ad',
      title: 'Anúncio com CTR Baixo',
      description: 'Anúncio "Oferta Black Friday" com CTR de 0.8%. Considere pausar ou recriar.',
      impact: '-R$ 500/mês',
      severity: 'error',
      action: 'Pausar Anúncio',
    },
    {
      id: 3,
      type: 'campaign',
      title: 'Otimizar Público-Alvo',
      description: 'Público "Mulheres 25-35" com CPC alto. Sugerimos segmentar melhor.',
      impact: '-15% CPC',
      severity: 'warning',
      action: 'Otimizar',
    },
  ]
  
  return (
    <div className="bg-[#1f1915] border border-[#d8c5b6] rounded-lg p-6">
      <h2 className="text-lg font-bold text-[#f18535] mb-4">
        💡 Recomendações de Anúncios e Campanhas
      </h2>
      
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded border-l-4 bg-[#13121a] ${
              rec.severity === 'success'
                ? 'border-l-green-500'
                : rec.severity === 'error'
                ? 'border-l-red-500'
                : 'border-l-yellow-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[#d8c5b6] font-semibold">{rec.title}</h3>
              <span className={`text-sm font-bold ${
                rec.severity === 'success'
                  ? 'text-green-400'
                  : rec.severity === 'error'
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }`}>
                {rec.impact}
              </span>
            </div>
            
            <p className="text-[#d8c5b6] text-sm mb-3">{rec.description}</p>
            
            <button className="text-[#f18535] text-sm font-semibold hover:underline">
              {rec.action} →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
