'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts'
import { formatCurrency, formatNumber } from '@/utils/formatters'

interface DemographicsGenderItem {
  gender: string
  spend?: string
  clicks?: string
}

interface DemographicsAgeItem {
  age: string
  spend?: string
  clicks?: string
}

export function DemographicsCharts({ 
  genderData, 
  ageData 
}: { 
  genderData: DemographicsGenderItem[]
  ageData: DemographicsAgeItem[] 
}) {
  // Format Gender Data
  const formattedGender = genderData.map(d => ({
    name: d.gender === 'male' ? 'Masculino' : d.gender === 'female' ? 'Feminino' : 'Outros',
    spend: parseFloat(d.spend || '0'),
    clicks: parseInt(d.clicks || '0', 10)
  })).filter(d => d.spend > 0)

  // Format Age Data
  const formattedAge = ageData.map(d => ({
    name: d.age,
    spend: parseFloat(d.spend || '0'),
    clicks: parseInt(d.clicks || '0', 10)
  })).filter(d => d.spend > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gender Chart */}
      <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg h-96 flex flex-col">
        <h3 className="text-lg font-medium text-white mb-6">Investimento por Gênero</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedGender} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: unknown, name?: string | number) => [
                  name === 'spend' ? formatCurrency(Number(value)) : formatNumber(Number(value)), 
                  name === 'spend' ? 'Investimento' : 'Cliques'
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Bar dataKey="spend" name="Investimento" fill="#E8733A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="clicks" name="Cliques" fill="#C4956A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Age Chart */}
      <div className="bg-[var(--card)] rounded-xl border border-white/5 p-6 shadow-lg h-96 flex flex-col">
        <h3 className="text-lg font-medium text-white mb-6">Cliques por Faixa Etária</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedAge} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} width={50} />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: unknown) => [formatNumber(Number(value)), 'Cliques']}
              />
              <Bar dataKey="clicks" name="Cliques" fill="#E8733A" radius={[0, 4, 4, 0]}>
                {formattedAge.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#E8733A' : '#C4956A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
