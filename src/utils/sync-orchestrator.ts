import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { decrypt } from '@/utils/crypto';
import {
  refreshMetaToken,
  fetchCampaigns,
  fetchAdSets,
  fetchAds,
  fetchInsights,
  parseMetaActions,
  calculateAdsMetrics
} from '@/utils/meta-api';
import { generateInsightsReport } from '@/utils/insights-generator';

export async function performAdminSync(adminId: string, tokenRecord: any, isTest: boolean = false) {
  const startTime = Date.now();
  let campaignsCount = 0;
  let adsetsCount = 0;
  let adsCount = 0;
  let metricsSavedCount = 0;

  // 1. Auto-refresh if token is expired
  let token = decrypt(tokenRecord.access_token);
  const now = new Date();
  const expiresAt = tokenRecord.token_expires_at ? new Date(tokenRecord.token_expires_at) : null;

  if (expiresAt && expiresAt <= now) {
    token = await refreshMetaToken(adminId, tokenRecord.id);
  }

  // 2. Fetch campaigns list
  let campaignsList = await fetchCampaigns(tokenRecord.account_id, token);
  
  // Apply test filter limit
  if (isTest && campaignsList.length > 0) {
    campaignsList = campaignsList.slice(0, 1);
  }

  // Date range for past 7 days history
  const today = new Date();
  const pastDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const formatDateStr = (d: Date) => d.toISOString().split('T')[0];
  const dateRange = {
    start: formatDateStr(pastDate),
    end: formatDateStr(today)
  };

  // 3. Main loop
  for (const camp of campaignsList) {
    // Upsert campaign
    const { data: dbCamp, error: campErr } = await supabase
      .from('campaigns')
      .upsert({
        admin_id: adminId,
        meta_campaign_id: camp.id,
        name: camp.name,
        status: camp.status,
        objective: camp.objective,
        daily_budget: camp.daily_budget ? camp.daily_budget / 100 : null,
        lifetime_budget: camp.lifetime_budget ? camp.lifetime_budget / 100 : null,
        updated_at: new Date().toISOString()
      }, { onConflict: 'meta_campaign_id' })
      .select('id')
      .single();

    if (campErr || !dbCamp) {
      console.error(`Failed to upsert campaign ${camp.name}:`, campErr);
      continue;
    }
    campaignsCount++;

    // Fetch and save Campaign-level insights
    try {
      const campInsights = await fetchInsights(camp.id, token, dateRange);
      for (const ins of campInsights) {
        const { conversions, messages, value: actionValues } = parseMetaActions(ins.actions, ins.action_values);
        const calculated = calculateAdsMetrics({
          spend: parseFloat(ins.spend) || 0,
          impressions: parseInt(ins.impressions) || 0,
          clicks: parseInt(ins.clicks) || 0,
          link_clicks: parseInt(ins.inline_link_clicks) || 0,
          reach: parseInt(ins.reach) || 0,
          frequency: parseFloat(ins.frequency) || 0,
          conversions,
          messages,
          action_values: actionValues
        });

        // Upsert campaign metrics (adset_id and ad_id set to NULL)
        await supabase.from('ads_metrics').insert({
          admin_id: adminId,
          campaign_id: dbCamp.id,
          adset_id: null,
          ad_id: null,
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
        metricsSavedCount++;

        // Generate insights/reports for this campaign using calculated metrics
        await generateInsightsReport(adminId, dbCamp.id, null, null, {
          ctr: calculated.ctr,
          roi: calculated.roi,
          cpa: calculated.cpa,
          spend: calculated.spend
        });
      }
    } catch (insErr) {
      console.error(`Failed to fetch insights for campaign ${camp.name}:`, insErr);
    }

    // Fetch adsets
    let adsetsList = await fetchAdSets(camp.id, token);
    if (isTest && adsetsList.length > 0) {
      adsetsList = adsetsList.slice(0, 1);
    }

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

      if (adsetErr || !dbAdset) {
        console.error(`Failed to upsert adset ${adset.name}:`, adsetErr);
        continue;
      }
      adsetsCount++;

      // Fetch ads
      let adsList = await fetchAds(adset.id, token);
      if (isTest && adsList.length > 0) {
        adsList = adsList.slice(0, 1);
      }

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

        if (adErr || !dbAd) {
          console.error(`Failed to upsert ad ${ad.name}:`, adErr);
          continue;
        }
        adsCount++;

        // Fetch and save Ad-level metrics
        try {
          const adInsights = await fetchInsights(ad.id, token, dateRange);
          for (const ins of adInsights) {
            const { conversions, messages, value: actionValues } = parseMetaActions(ins.actions, ins.action_values);
            const calculated = calculateAdsMetrics({
              spend: parseFloat(ins.spend) || 0,
              impressions: parseInt(ins.impressions) || 0,
              clicks: parseInt(ins.clicks) || 0,
              link_clicks: parseInt(ins.inline_link_clicks) || 0,
              reach: parseInt(ins.reach) || 0,
              frequency: parseFloat(ins.frequency) || 0,
              conversions,
              messages,
              action_values: actionValues
            });

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
            metricsSavedCount++;
          }
        } catch (adInsErr) {
          console.error(`Failed to fetch insights for ad ${ad.name}:`, adInsErr);
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;

  return {
    campaignsCount,
    adsetsCount,
    adsCount,
    metricsSavedCount,
    durationMs
  };
}
