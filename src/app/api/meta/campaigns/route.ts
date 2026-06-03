import { NextResponse } from 'next/server'
import { fetchCampaigns, fetchAdSets, fetchAds, MetaAPIError } from '@/lib/meta-api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id') || process.env.META_AD_ACCOUNT_ID

    if (!accountId) {
      return NextResponse.json({ error: 'O parâmetro "account_id" é obrigatório.' }, { status: 400 })
    }

    // Load campaigns, adsets, and ads in parallel
    const [campaigns, adsets, ads] = await Promise.all([
      fetchCampaigns(accountId),
      fetchAdSets(undefined, accountId),
      fetchAds(undefined, accountId)
    ])

    return NextResponse.json({ campaigns, adsets, ads })
  } catch (error) {
    console.error('Erro na Rota /api/meta/campaigns:', error)
    if (error instanceof MetaAPIError) {
      const status = error.code === 17 ? 429 : 400
      return NextResponse.json({ error: error.message, code: error.code }, { status })
    }
    const message = error instanceof Error ? error.message : 'Erro interno do servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
