'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Calendar, Filter, Folder, Layers, Megaphone } from 'lucide-react'

interface Campaign {
  id: string
  name: string
}

interface Adset {
  id: string
  name: string
  campaign_id: string
}

interface Ad {
  id: string
  name: string
  adset_id: string
}

interface DashboardFiltersProps {
  campaigns?: Campaign[]
  adsets?: Adset[]
  ads?: Ad[]
}

export function DashboardFilters({ campaigns = [], adsets = [], ads = [] }: DashboardFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPreset = searchParams.get('date_preset') || 'last_30d'
  const currentCampaign = searchParams.get('campaign_id') || ''
  const currentAdset = searchParams.get('adset_id') || ''
  const currentAd = searchParams.get('ad_id') || ''

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('date_preset', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set('campaign_id', val)
    } else {
      params.delete('campaign_id')
    }
    // Reset child filters when campaign changes
    params.delete('adset_id')
    params.delete('ad_id')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleAdsetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set('adset_id', val)
    } else {
      params.delete('adset_id')
    }
    // Reset child filter when adset changes
    params.delete('ad_id')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleAdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set('ad_id', val)
    } else {
      params.delete('ad_id')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Enchained filtering for dropdown lists
  const filteredAdsets = currentCampaign
    ? adsets.filter(a => a.campaign_id === currentCampaign)
    : adsets

  const allowedAdsetIds = new Set(filteredAdsets.map(a => a.id))

  const filteredAds = currentAdset
    ? ads.filter(ad => ad.adset_id === currentAdset)
    : currentCampaign
      ? ads.filter(ad => allowedAdsetIds.has(ad.adset_id))
      : ads

  const selectStyle = "bg-black/20 border border-white/10 text-white text-sm rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] block p-2 transition-colors cursor-pointer outline-none appearance-none pr-8 relative"
  const arrowBg = {
    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23a1a1aa\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
    backgroundPosition: 'right 0.5rem center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '1.5em 1.5em'
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-[var(--card)] p-4 rounded-xl border border-white/5 shadow-sm w-full">
      <div className="flex items-center gap-2 shrink-0">
        <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
        <span className="text-sm font-medium text-white">Filtros:</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-4 w-full">
        {/* Date Preset */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
          <select
            value={currentPreset}
            onChange={handleDateChange}
            className={selectStyle}
            style={arrowBg}
          >
            <option value="today">Hoje</option>
            <option value="last_7d">Últimos 7 dias</option>
            <option value="last_14d">Últimos 15 dias</option>
            <option value="last_30d">Últimos 30 dias</option>
            <option value="this_month">Mês Atual</option>
            <option value="maximum">Todo o período</option>
          </select>
        </div>

        {/* Campaign Filter */}
        {campaigns.length > 0 && (
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
            <select
              value={currentCampaign}
              onChange={handleCampaignChange}
              className={`${selectStyle} max-w-[200px] truncate`}
              style={arrowBg}
            >
              <option value="">Todas as Campanhas</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Adset Filter */}
        {filteredAdsets.length > 0 && (
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
            <select
              value={currentAdset}
              onChange={handleAdsetChange}
              className={`${selectStyle} max-w-[200px] truncate`}
              style={arrowBg}
            >
              <option value="">Todos os Conjuntos</option>
              {filteredAdsets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Ad Filter */}
        {filteredAds.length > 0 && (
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--text-secondary)] shrink-0" />
            <select
              value={currentAd}
              onChange={handleAdChange}
              className={`${selectStyle} max-w-[200px] truncate`}
              style={arrowBg}
            >
              <option value="">Todos os Anúncios</option>
              {filteredAds.map(ad => (
                <option key={ad.id} value={ad.id}>
                  {ad.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

