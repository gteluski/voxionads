import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import { encrypt } from '@/utils/crypto';

export async function GET(req: Request) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Não autorizado. Inicie sessão administrativamente.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    // Retrieve state cookie to validate against CSRF
    const cookieState = req.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('meta_oauth_state='))
      ?.split('=')[1];

    // Validate state matching
    if (!state || state !== cookieState) {
      return NextResponse.json(
        { error: 'Parâmetro de estado inválido ou cookies expirados.' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Código de autorização ausente.' },
        { status: 400 }
      );
    }

    const clientId = process.env.META_CLIENT_ID || '';
    const clientSecret = process.env.META_CLIENT_SECRET || '';
    const redirectUri = process.env.META_REDIRECT_URI || '';

    let accessToken = 'mock_access_token_' + Math.random().toString(36).substring(7);
    let refreshToken = 'mock_refresh_token_' + Math.random().toString(36).substring(7);
    let tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days standard Meta long-lived
    let accountId = 'act_12093849102';
    let accountName = 'Voxion Ads BM Client';
    let businessManagerId = 'bm_98471029384';

    const isMock = !clientSecret || clientSecret.includes('placeholder');

    if (!isMock) {
      // 1. Exchange short-lived authorization code for user access token
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${clientSecret}&code=${code}`;

      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        throw new Error(tokenData.error?.message || 'Falha ao trocar código pelo token de acesso.');
      }

      const shortLivedToken = tokenData.access_token;

      // 2. Exchange short-lived token for a long-lived 60-day access token
      const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
      const longLivedRes = await fetch(longLivedUrl);
      const longLivedData = await longLivedRes.json();

      if (!longLivedRes.ok) {
        throw new Error(longLivedData.error?.message || 'Falha ao obter token de longa duração.');
      }

      accessToken = longLivedData.access_token;
      if (longLivedData.expires_in) {
        tokenExpiresAt = new Date(Date.now() + longLivedData.expires_in * 1000).toISOString();
      }

      // 3. Fetch Ad Account and Business details using the long-lived token
      const accountUrl = `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,business&access_token=${accessToken}`;
      const accountRes = await fetch(accountUrl);
      const accountData = await accountRes.json();

      if (accountRes.ok && accountData.data && accountData.data.length > 0) {
        const primaryAccount = accountData.data[0];
        accountId = primaryAccount.id;
        accountName = primaryAccount.name;
        businessManagerId = primaryAccount.business?.id || '';
      }
    }

    // 4. Encrypt sensitive tokens using crypto helper
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken);

    // 5. Store / Update meta_tokens inside Supabase
    // Check if the user already has a connected meta_token
    const { data: existingToken } = await supabase
      .from('meta_tokens')
      .select('id')
      .eq('admin_id', session.user.admin_id)
      .eq('account_id', accountId)
      .maybeSingle();

    if (existingToken) {
      const { error: updateError } = await supabase
        .from('meta_tokens')
        .update({
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          account_name: accountName,
          business_manager_id: businessManagerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('meta_tokens')
        .insert({
          admin_id: session.user.admin_id,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          account_id: accountId,
          account_name: accountName,
          business_manager_id: businessManagerId,
        });

      if (insertError) throw insertError;
    }

    // Log connection inside audit_logs
    await supabase.from('audit_logs').insert({
      admin_id: session.user.admin_id,
      action: 'META_AUTH_CONNECTED',
      details: `Conta de anúncios Meta ${accountName} (${accountId}) conectada ${isMock ? '(Modo Demo)' : '(Real)'}.`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent') || 'Meta OAuth Callback',
    });

    // Clear state cookie
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', req.url));
    redirectResponse.cookies.set('meta_oauth_state', '', { maxAge: 0 });

    return redirectResponse;
  } catch (error: any) {
    console.error('Meta Callback API Error:', error);
    
    // Log failures to sync_log/audit_logs
    try {
      const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
      if (session?.user?.admin_id) {
        await supabase.from('sync_log').insert({
          admin_id: session.user.admin_id,
          status: 'ERROR',
          message: `Falha no callback Meta OAuth: ${error.message || 'Erro desconhecido'}`,
          synced_at: new Date().toISOString(),
          duration_ms: 0
        });
      }
    } catch (logErr) {
      console.error('Failed to write failure log:', logErr);
    }

    return NextResponse.json(
      { error: `Erro no callback de autenticação: ${error.message || 'Erro interno'}` },
      { status: 500 }
    );
  }
}
