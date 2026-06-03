import crypto from 'crypto'

export class MetaAPIError extends Error {
  code: number
  constructor(message: string, code: number) {
    super(message)
    this.name = 'MetaAPIError'
    this.code = code
  }
}

export interface MetaInsights {
  impressions?: string
  reach?: string
  spend?: string
  clicks?: string
  ctr?: string
  cpc?: string
}

export interface CampaignData {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: string
  lifetime_budget?: string
  start_time: string
  stop_time?: string
  insights?: {
    data: MetaInsights[]
  }
}

export interface AdSetData {
  id: string
  name: string
  status: string
  campaign_id: string
  campaign?: {
    id: string
    name: string
  }
  daily_budget?: string
  lifetime_budget?: string
  start_time: string
  stop_time?: string
  insights?: {
    data: MetaInsights[]
  }
}

export interface AdData {
  id: string
  name: string
  status: string
  adset_id: string
  adset?: {
    id: string
    name: string
  }
  campaign_id: string
  insights?: {
    data: MetaInsights[]
  }
}

function getAppSecretProof(accessToken: string, appSecret: string): string {
  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex')
}

async function requestMetaAPI(endpoint: string, params: Record<string, string> = {}) {
  const accessToken = process.env.META_ACCESS_TOKEN
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  
  if (!accessToken || !appId || !appSecret) {
    throw new Error('As variáveis de ambiente META_ACCESS_TOKEN, META_APP_ID e META_APP_SECRET não estão devidamente configuradas.')
  }

  const appsecretProof = getAppSecretProof(accessToken, appSecret)

  const queryParams = new URLSearchParams({
    access_token: accessToken,
    appsecret_proof: appsecretProof,
    ...params
  })

  const url = `https://graph.facebook.com/v20.0/${endpoint}?${queryParams.toString()}`

  const response = await fetch(url, {
    next: { revalidate: 300 } // Cache results for 5 mins
  })
  
  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.error) {
    const code = data.error?.code
    const message = data.error?.message || `Erro HTTP! Status: ${response.status}`

    if (code === 190) {
      throw new MetaAPIError('Token de acesso expirado ou inválido (Erro 190). Por favor, configure um novo token.', 190)
    }
    if (code === 100) {
      throw new MetaAPIError('Permissão insuficiente ou ID de conta inválido (Erro 100). Verifique as configurações de acesso.', 100)
    }
    if (code === 17) {
      throw new MetaAPIError('Limite de requisições da API do Meta atingido (Erro 17). Aguarde um momento e tente novamente.', 17)
    }
    throw new MetaAPIError(`${message} (Erro ${code || 'desconhecido'})`, code || 500)
  }

  return data
}

export async function fetchCampaigns(accountId?: string): Promise<CampaignData[]> {
  const targetAccountId = accountId || process.env.META_AD_ACCOUNT_ID
  if (!targetAccountId) {
    throw new Error('ID da Conta de Anúncios (META_AD_ACCOUNT_ID) não fornecido nas variáveis de ambiente nem como parâmetro.')
  }

  const cleanId = targetAccountId.startsWith('act_') ? targetAccountId : `act_${targetAccountId}`
  
  const response = await requestMetaAPI(`${cleanId}/campaigns`, {
    fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,insights{impressions,reach,spend,clicks,ctr,cpc}',
    limit: '100'
  })

  return response.data || []
}

export async function fetchAdSets(campaignId?: string, accountId?: string): Promise<AdSetData[]> {
  if (campaignId) {
    const response = await requestMetaAPI(`${campaignId}/adsets`, {
      fields: 'id,name,status,campaign{id,name},campaign_id,daily_budget,lifetime_budget,start_time,stop_time,insights{impressions,reach,spend,clicks,ctr,cpc}',
      limit: '100'
    })
    return response.data || []
  }

  const targetAccountId = accountId || process.env.META_AD_ACCOUNT_ID
  if (!targetAccountId) {
    throw new Error('ID da Conta de Anúncios (META_AD_ACCOUNT_ID) deve ser fornecido quando não houver ID da Campanha.')
  }

  const cleanId = targetAccountId.startsWith('act_') ? targetAccountId : `act_${targetAccountId}`

  const response = await requestMetaAPI(`${cleanId}/adsets`, {
    fields: 'id,name,status,campaign{id,name},campaign_id,daily_budget,lifetime_budget,start_time,stop_time,insights{impressions,reach,spend,clicks,ctr,cpc}',
    limit: '100'
  })

  return response.data || []
}

export async function fetchAds(adSetId?: string, accountId?: string): Promise<AdData[]> {
  if (adSetId) {
    const response = await requestMetaAPI(`${adSetId}/ads`, {
      fields: 'id,name,status,adset{id,name},adset_id,campaign_id,insights{impressions,reach,spend,clicks,ctr,cpc}',
      limit: '100'
    })
    return response.data || []
  }

  const targetAccountId = accountId || process.env.META_AD_ACCOUNT_ID
  if (!targetAccountId) {
    throw new Error('ID da Conta de Anúncios (META_AD_ACCOUNT_ID) deve ser fornecido quando não houver ID do Conjunto de Anúncios.')
  }

  const cleanId = targetAccountId.startsWith('act_') ? targetAccountId : `act_${targetAccountId}`

  const response = await requestMetaAPI(`${cleanId}/ads`, {
    fields: 'id,name,status,adset{id,name},adset_id,campaign_id,insights{impressions,reach,spend,clicks,ctr,cpc}',
    limit: '100'
  })

  return response.data || []
}
