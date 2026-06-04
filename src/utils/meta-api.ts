import { supabase } from '@/lib/supabase';
import { decrypt, encrypt } from '@/utils/crypto';

// Retry helper using exponential backoff
async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Custom error for rate limiting
class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Custom error for token expiration
class TokenExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

/**
 * Base fetch wrapper implementing rate limit handling with exponential backoff
 * and token expiration errors.
 */
async function fetchMetaAPI(
  url: string,
  options: RequestInit = {},
  attempt = 1
): Promise<any> {
  const maxAttempts = 5;

  try {
    const res = await fetch(url, options);
    const data = await res.json();

    if (!res.ok) {
      const errorCode = data.error?.code;
      const errorSubcode = data.error?.error_subcode;

      // Token Expired / Invalid (Error code 190)
      if (errorCode === 190) {
        throw new TokenExpiredError(data.error?.message || 'Token expirado ou inválido.');
      }

      // Rate limit / Throttling (Error code 4 or 17)
      if (errorCode === 4 || errorCode === 17 || data.error?.message?.includes('rate limit')) {
        if (attempt <= maxAttempts) {
          const backoffSecs = Math.pow(2, attempt); // 2^1, 2^2, 2^3...
          console.warn(`[Meta API] Rate limit atingida. Tentativa ${attempt} de ${maxAttempts}. Aguardando ${backoffSecs}s...`);
          await sleep(backoffSecs * 1000);
          return fetchMetaAPI(url, options, attempt + 1);
        } else {
          throw new RateLimitError('Limite de requisições Meta excedido. Tentativas esgotadas.');
        }
      }

      throw new Error(data.error?.message || 'Erro desconhecido na API do Meta.');
    }

    return data;
  } catch (error: any) {
    if (error instanceof TokenExpiredError || error instanceof RateLimitError) {
      throw error;
    }
    
    // Retry other unexpected network failures
    if (attempt <= maxAttempts) {
      const backoffSecs = Math.pow(2, attempt);
      await sleep(backoffSecs * 1000);
      return fetchMetaAPI(url, options, attempt + 1);
    }
    throw error;
  }
}

/**
 * Attempt to refresh Meta Graph access token using the stored refresh token.
 */
export async function refreshMetaToken(adminId: string, tokenId: string): Promise<string> {
  console.log(`[Meta API] Tentando renovar o token para o admin_id: ${adminId}`);
  
  const clientId = process.env.META_CLIENT_ID || '';
  const clientSecret = process.env.META_CLIENT_SECRET || '';

  if (!clientId || !clientSecret || clientSecret.includes('placeholder')) {
    console.log('[Meta API] Credenciais de teste detectadas. Simulando refresh de token.');
    return 'mock_refreshed_access_token_' + Math.random().toString(36).substring(7);
  }

  // 1. Fetch current token information from DB
  const { data: tokenRecord, error } = await supabase
    .from('meta_tokens')
    .select('*')
    .eq('id', tokenId)
    .single();

  if (error || !tokenRecord) {
    throw new Error('Registro de token não encontrado para atualização.');
  }

  const decryptedRefreshToken = decrypt(tokenRecord.refresh_token);

  // 2. Query Meta to swap long-lived token
  const refreshUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${decryptedRefreshToken}`;
  const res = await fetch(refreshUrl);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Falha ao renovar token de acesso junto ao Meta.');
  }

  const newAccessToken = data.access_token;
  const encryptedNewAccessToken = encrypt(newAccessToken);
  const newExpiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000).toISOString()
    : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

  // 3. Update database
  const { error: updateError } = await supabase
    .from('meta_tokens')
    .update({
      access_token: encryptedNewAccessToken,
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tokenId);

  if (updateError) {
    throw updateError;
  }

  return newAccessToken;
}

/**
 * Execute a Meta API call, handling automatic token refresh if token expired.
 */
async function executeWithTokenRefresh(
  adminId: string,
  tokenId: string,
  encryptedToken: string,
  apiCallFn: (token: string) => Promise<any>
): Promise<any> {
  let decryptedToken = decrypt(encryptedToken);

  try {
    return await apiCallFn(decryptedToken);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      console.warn('[Meta API] Token expirado detectado (Erro 190). Executando auto-refresh.');
      try {
        const freshToken = await refreshMetaToken(adminId, tokenId);
        // Retry with the refreshed token
        return await apiCallFn(freshToken);
      } catch (refreshErr: any) {
        console.error('[Meta API] Falha crítica ao atualizar token:', refreshErr);
        throw new Error(`Token expirado e falha no auto-refresh: ${refreshErr.message}`);
      }
    }
    throw error;
  }
}

// -------------------------------------------------------------
// Core Meta API Endpoints (Campaigns, AdSets, Ads, Insights)
// -------------------------------------------------------------

export async function fetchCampaigns(accountId: string, token: string): Promise<any[]> {
  // If running with mock keys, return demo data
  if (token.startsWith('mock_')) {
    return [
      { id: 'act_12093849102-c1', name: 'Campanha Conversão - Black Friday 2026', status: 'ACTIVE', objective: 'CONVERSIONS', daily_budget: 500.00, lifetime_budget: null },
      { id: 'act_12093849102-c2', name: 'Lookalike Leads Premium - Whitelist', status: 'ACTIVE', objective: 'LEAD_GENERATION', daily_budget: 250.00, lifetime_budget: null },
      { id: 'act_12093849102-c3', name: 'Retargeting Carrinho Abandonado 7D', status: 'PAUSED', objective: 'CONVERSIONS', daily_budget: 100.00, lifetime_budget: null },
      { id: 'act_12093849102-c4', name: 'Branding & Tráfego Frio - Reels Video', status: 'ACTIVE', objective: 'OUTDOOR / VIDEO_VIEWS', daily_budget: 150.00, lifetime_budget: null }
    ];
  }

  const url = `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget&access_token=${token}`;
  const data = await fetchMetaAPI(url);
  return data.data || [];
}

export async function fetchAdSets(campaignId: string, token: string): Promise<any[]> {
  if (token.startsWith('mock_')) {
    return [
      { id: 'as1', campaign_id: campaignId, name: 'Adset - Público Quente 30D (Lookalike)', status: 'ACTIVE', daily_budget: 300.00, optimization_goal: 'PURCHASE' },
      { id: 'as2', campaign_id: campaignId, name: 'Adset - Interesses E-commerce', status: 'ACTIVE', daily_budget: 200.00, optimization_goal: 'PURCHASE' }
    ];
  }

  const url = `https://graph.facebook.com/v18.0/${campaignId}/adsets?fields=id,name,status,daily_budget,optimization_goal&access_token=${token}`;
  const data = await fetchMetaAPI(url);
  return data.data || [];
}

export async function fetchAds(adsetId: string, token: string): Promise<any[]> {
  if (token.startsWith('mock_')) {
    return [
      { id: 'ad1', adset_id: adsetId, name: 'Criativo 01 - Vídeo de Depoimentos', status: 'ACTIVE' },
      { id: 'ad2', adset_id: adsetId, name: 'Criativo 02 - Carrossel Benefícios', status: 'ACTIVE' }
    ];
  }

  const url = `https://graph.facebook.com/v18.0/${adsetId}/ads?fields=id,name,status&access_token=${token}`;
  const data = await fetchMetaAPI(url);
  return data.data || [];
}

/**
 * Fetch insights from Meta for a given object (AdAccount, Campaign, AdSet, or Ad)
 */
export async function fetchInsights(
  objectId: string,
  token: string,
  dateRange: { start: string; end: string }
): Promise<any[]> {
  if (token.startsWith('mock_')) {
    // Generate realistic daily insights
    return [
      {
        spend: '125.40',
        impressions: '5200',
        clicks: '150',
        inline_link_clicks: '110',
        reach: '4800',
        frequency: '1.08',
        actions: [
          { action_type: 'onsite_conversion.messaging_first_reply', value: '4' },
          { action_type: 'purchase', value: '8' }
        ],
        action_values: [
          { action_type: 'purchase', value: '450.00' }
        ],
        date_start: dateRange.start
      }
    ];
  }

  const url = `https://graph.facebook.com/v18.0/${objectId}/insights?time_range={"since":"${dateRange.start}","until":"${dateRange.end}"}&time_increment=1&fields=spend,impressions,clicks,inline_link_clicks,reach,frequency,actions,action_values&access_token=${token}`;
  const data = await fetchMetaAPI(url);
  return data.data || [];
}

// -------------------------------------------------------------
// Metrics Processing / Calculations
// -------------------------------------------------------------

export interface MetaRawMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  link_clicks: number;
  reach: number;
  frequency: number;
  conversions: number;
  messages: number;
  action_values: number;
}

export interface AdsMetricsSchema extends MetaRawMetrics {
  cpc: number;
  cpc_link: number;
  cpm: number;
  cpm_impression: number;
  cpa: number;
  cpm_message: number;
  ctr: number;
  roi: number;
}

/**
 * Parse raw action lists from Meta API to extract conversion, messages and values.
 */
export function parseMetaActions(actions: any[], actionValues: any[]): { conversions: number; messages: number; value: number } {
  let conversions = 0;
  let messages = 0;
  let value = 0;

  if (actions) {
    for (const act of actions) {
      if (act.action_type === 'purchase' || act.action_type === 'offsite_conversion.fb_pixel_purchase') {
        conversions += parseInt(act.value) || 0;
      }
      if (act.action_type === 'onsite_conversion.messaging_first_reply' || act.action_type === 'onsite_conversion.messaging_conversation_started-72hrs') {
        messages += parseInt(act.value) || 0;
      }
    }
  }

  if (actionValues) {
    for (const val of actionValues) {
      if (val.action_type === 'purchase' || val.action_type === 'offsite_conversion.fb_pixel_purchase') {
        value += parseFloat(val.value) || 0;
      }
    }
  }

  return { conversions, messages, value };
}

/**
 * Transforms raw Meta API insight numbers and calculates calculated metrics
 * for the ads_metrics schema.
 */
export function calculateAdsMetrics(raw: MetaRawMetrics): AdsMetricsSchema {
  const { spend, impressions, clicks, link_clicks, reach, frequency, conversions, messages, action_values } = raw;

  return {
    spend,
    impressions,
    clicks,
    link_clicks,
    reach,
    frequency,
    conversions,
    messages,
    action_values,
    
    // Calculations:
    cpc: clicks > 0 ? spend / clicks : 0,
    cpc_link: link_clicks > 0 ? spend / link_clicks : 0,
    cpm: impressions > 0 ? (spend / impressions) * 1000 : 0,
    cpm_impression: impressions > 0 ? spend / impressions : 0,
    cpa: conversions > 0 ? spend / conversions : 0,
    cpm_message: messages > 0 ? spend / messages : 0,
    ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
    roi: spend > 0 ? ((action_values - spend) / spend) * 100 : 0
  };
}

/**
 * Main coordinator function triggering database sync loop.
 * Resolves meta_tokens, syncs campaigns, adsets, ads, and inserts metrics.
 */
export async function syncMetaAdsForToken(adminId: string, tokenRecord: any): Promise<void> {
  const startTime = Date.now();
  
  try {
    await executeWithTokenRefresh(adminId, tokenRecord.id, tokenRecord.access_token, async (token) => {
      // 1. Fetch campaigns
      const campaignsList = await fetchCampaigns(tokenRecord.account_id, token);

      for (const camp of campaignsList) {
        // Upsert campaign in database
        const { data: dbCamp, error: campErr } = await supabase
          .from('campaigns')
          .upsert({
            admin_id: adminId,
            meta_campaign_id: camp.id,
            name: camp.name,
            status: camp.status,
            objective: camp.objective,
            daily_budget: camp.daily_budget ? camp.daily_budget / 100 : null, // Meta API reports budgets in cents
            lifetime_budget: camp.lifetime_budget ? camp.lifetime_budget / 100 : null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'meta_campaign_id' })
          .select('id')
          .single();

        if (campErr || !dbCamp) continue;

        // 2. Fetch adsets
        const adsetsList = await fetchAdSets(camp.id, token);

        for (const adset of adsetsList) {
          const { data: dbAdset, error: adsetErr } = await supabase
            .from('ad_sets')
            .upsert({
              admin_id: adminId,
              campaign_id: dbCamp.id,
              meta_adset_id: adset.id,
              name: adset.name,
              status: adset.status,
              daily_budget: adset.daily_budget ? adset.daily_budget / 100 : null,
              optimization_goal: adset.optimization_goal,
              updated_at: new Date().toISOString()
            }, { onConflict: 'meta_adset_id' })
            .select('id')
            .single();

          if (adsetErr || !dbAdset) continue;

          // 3. Fetch ads
          const adsList = await fetchAds(adset.id, token);

          for (const ad of adsList) {
            const { data: dbAd, error: adErr } = await supabase
              .from('ads')
              .upsert({
                admin_id: adminId,
                adset_id: dbAdset.id,
                campaign_id: dbCamp.id,
                meta_ad_id: ad.id,
                name: ad.name,
                status: ad.status,
                updated_at: new Date().toISOString()
              }, { onConflict: 'meta_ad_id' })
              .select('id')
              .single();

            if (adErr || !dbAd) continue;

            // 4. Fetch Insights metrics (past 7 days for safety)
            const today = new Date();
            const pastDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
            const dateRange = {
              start: formatDateStr(pastDate),
              end: formatDateStr(today)
            };

            const insightsList = await fetchInsights(ad.id, token, dateRange);

            for (const ins of insightsList) {
              const { conversions, messages, value: actionValues } = parseMetaActions(ins.actions, ins.action_values);
              const rawMetrics: MetaRawMetrics = {
                spend: parseFloat(ins.spend) || 0,
                impressions: parseInt(ins.impressions) || 0,
                clicks: parseInt(ins.clicks) || 0,
                link_clicks: parseInt(ins.inline_link_clicks) || 0,
                reach: parseInt(ins.reach) || 0,
                frequency: parseFloat(ins.frequency) || 0,
                conversions,
                messages,
                action_values: actionValues
              };

              const calculated = calculateAdsMetrics(rawMetrics);

              // Upsert metric record into ads_metrics
              await supabase.from('ads_metrics').insert({
                admin_id: adminId,
                campaign_id: dbCamp.id,
                adset_id: dbAdset.id,
                ad_id: dbAd.id,
                date: ins.date_start,
                spend: calculated.spend,
                impressions: calculated.impressions,
                clicks: calculated.clicks,
                link_clicks: calculated.link_clicks,
                reach: calculated.reach,
                frequency: calculated.frequency,
                conversions: calculated.conversions,
                messages: calculated.messages,
                cpc: calculated.cpc,
                cpc_link: calculated.cpc_link,
                cpm: calculated.cpm,
                cpm_impression: calculated.cpm_impression,
                cpa: calculated.cpa,
                cpm_message: calculated.cpm_message,
                ctr: calculated.ctr,
                roi: calculated.roi,
                sync_at: new Date().toISOString()
              });
            }
          }
        }
      }
    });

    // Write SUCCESS log
    const duration = Date.now() - startTime;
    await supabase.from('sync_log').insert({
      admin_id: adminId,
      status: 'SUCCESS',
      message: `Sincronização completa realizada com sucesso para a conta ${tokenRecord.account_name}.`,
      synced_at: new Date().toISOString(),
      duration_ms: duration
    });

  } catch (syncError: any) {
    console.error('[Meta Sync] Erro crítico na sincronização:', syncError);
    
    // Log failure in database
    const duration = Date.now() - startTime;
    await supabase.from('sync_log').insert({
      admin_id: adminId,
      status: 'ERROR',
      message: `Falha na sincronização: ${syncError.message || 'Erro desconhecido'}`,
      synced_at: new Date().toISOString(),
      duration_ms: duration
    });

    // Add security audit trail
    await supabase.from('audit_logs').insert({
      admin_id: adminId,
      action: 'SYNC_FAILURE',
      details: `Erro crítico ao sincronizar Meta Ads para conta ${tokenRecord.account_id}: ${syncError.message || 'Erro de rede'}`,
      ip_address: '127.0.0.1',
      user_agent: 'Background Cron Sync Module'
    });
  }
}
