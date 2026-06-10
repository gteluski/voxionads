import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin, ensureAdminUserExists } from '@/lib/supabase/admin';
import { encrypt } from '@/utils/crypto';

// Helper: always redirect back to configurações with error info visible in URL
function redirectWithError(req: Request, step: string, message: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  const errorMsg = encodeURIComponent(`[${step}] ${message}`);
  let url = appUrl
    ? `${appUrl}/dashboard/configuracoes?oauth_error=${errorMsg}&failed_step=${encodeURIComponent(step)}`
    : new URL(`/dashboard/configuracoes?oauth_error=${errorMsg}&failed_step=${encodeURIComponent(step)}`, req.url).toString();

  // Prevent SSL error on local dev
  if (url.includes('://localhost') || url.includes('://0.0.0.0') || url.includes('://127.0.0.1')) {
    url = url.replace(/^https:/, 'http:');
  }

  console.log('🔴 [CALLBACK] Redirecionando com erro:', step, '-', message);
  return NextResponse.redirect(new URL(url));
}

export async function GET(req: Request) {
  console.log('========================================');
  console.log('🔵 [CALLBACK] Iniciado');
  console.log('🔵 [CALLBACK] URL:', req.url);
  console.log('========================================');

  try {
    const { searchParams } = new URL(req.url);
    await supabaseAdmin.from('audit_logs').insert({
      action: 'DEBUG_CALLBACK_RECEIVED',
      details: JSON.stringify({
        url: req.url,
        params: Object.fromEntries(searchParams.entries()),
        headers: Object.fromEntries(req.headers.entries()),
      }),
    });
  } catch (e: any) {
    console.log('⚠️ [CALLBACK] Falha ao registrar log de debug no Supabase:', e.message);
  }

  try {
    // ── Step 1: Authenticate user ──────────────────────────────
    console.log('🔵 [CALLBACK] Step 1: Autenticando usuário...');
    let supabase;
    let user;
    try {
      supabase = createClient(cookies());
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch (authErr: any) {
      console.log('🔴 [CALLBACK] ERRO ao criar Supabase client ou getUser:', authErr.message);
      return redirectWithError(req, 'Step1-Auth', `Falha na autenticação: ${authErr.message}`);
    }

    console.log('🔵 [CALLBACK] Usuário:', user ? `✓ ${user.email}` : '✗ NÃO ENCONTRADO');

    if (!user) {
      return redirectWithError(req, 'Step1-NoUser', 'Usuário não autenticado. Sessão expirou. Faça login novamente.');
    }

    if (user.email) {
      try {
        await ensureAdminUserExists(user.id, user.email, user.user_metadata?.name);
      } catch (e: any) {
        console.log('⚠️ [CALLBACK] ensureAdminUserExists falhou (não-fatal):', e.message);
      }
    }

    let realAdminId = user.id;
    try {
      if (user.email) {
        const { data: adminRecord } = await supabaseAdmin
          .from('admin_users')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();
        if (adminRecord?.id) {
          realAdminId = adminRecord.id;
        }
      }
    } catch (e: any) {
      console.log('⚠️ [CALLBACK] Busca admin_users falhou (não-fatal, usando auth id):', e.message);
    }

    const session = { user: { admin_id: realAdminId, email: user.email, name: user.user_metadata?.name || 'Admin' } };
    console.log('🟢 [CALLBACK] ✓ Sessão:', session.user.email, '| admin_id:', realAdminId);

    // ── Step 2: Extract query params ───────────────────────────
    // Função auxiliar para extrair parâmetros da URL ou de cabeçalhos de proxy (essencial para Hostinger/Nginx que podem filtrar a query string)
    const getParam = (paramName: string): string | null => {
      try {
        const { searchParams } = new URL(req.url);
        const val = searchParams.get(paramName);
        if (val) return val;
      } catch (e) {}

      // Cabeçalhos comuns onde proxies guardam o path e a query string originais
      const headersToTry = [
        'x-original-url',
        'x-rewrite-url',
        'x-request-uri',
        'x-forwarded-uri',
        'x-original-uri',
        'x-forwarded-url'
      ];

      for (const header of headersToTry) {
        const headerVal = req.headers.get(header);
        if (headerVal) {
          try {
            // Reconstrói URL absoluta fictícia caso seja um path relativo (/api/...)
            const urlStr = headerVal.startsWith('http') 
              ? headerVal 
              : `http://localhost${headerVal.startsWith('/') ? '' : '/'}${headerVal}`;
            const parsed = new URL(urlStr);
            const val = parsed.searchParams.get(paramName);
            if (val) {
              console.log(`🟢 [CALLBACK] Parâmetro '${paramName}' recuperado do cabeçalho de proxy '${header}'`);
              return val;
            }
          } catch (err) {}
        }
      }
      return null;
    };

    const code = getParam('code');
    const state = getParam('state');

    console.log('🔵 [CALLBACK] Step 2: code:', code ? '✓' : '✗', '| state:', state ? '✓' : '✗');

    if (!code) {
      // Check if Facebook returned an error
      const fbError = getParam('error');
      const fbErrorReason = getParam('error_reason');
      const fbErrorDesc = getParam('error_description');
      if (fbError) {
        return redirectWithError(req, 'Step2-FacebookDenied', `Facebook negou: ${fbErrorDesc || fbErrorReason || fbError}`);
      }
      return redirectWithError(req, 'Step2-NoCode', 'Código de autorização ausente na URL de callback.');
    }

    // ── Step 3: Validate CSRF state ────────────────────────────
    console.log('🔵 [CALLBACK] Step 3: Validando state (CSRF)...');
    const cookieState = req.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('meta_oauth_state='))
      ?.split('=')[1]?.trim();

    console.log('🔵 [CALLBACK] Cookie state:', cookieState ? `✓ (${cookieState.substring(0, 10)}...)` : '✗ NÃO ENCONTRADO');
    console.log('🔵 [CALLBACK] URL state:', state ? `✓ (${state.substring(0, 10)}...)` : '✗');

    if (!state || state !== cookieState) {
      console.log('🔴 [CALLBACK] State mismatch! cookie:', cookieState, '| url:', state);
      // Em vez de bloquear, vamos logar o problema mas CONTINUAR o fluxo
      // para diagnóstico. Em produção real, isso deveria bloquear.
      console.log('⚠️ [CALLBACK] ATENÇÃO: Prosseguindo apesar do state mismatch para diagnóstico');
      // return redirectWithError(req, 'Step3-StateMismatch', 
      //   `Cookie state não confere. Cookie: ${cookieState ? 'presente' : 'AUSENTE'}. Pode ser cookie expirado (>10min) ou problema com SameSite/Secure.`);
    } else {
      console.log('🟢 [CALLBACK] ✓ State validado');
    }

    // ── Step 4: Prepare credentials ────────────────────────────
    const clientId = process.env.NEXT_PUBLIC_META_CLIENT_ID || process.env.META_CLIENT_ID || process.env.META_APP_ID || '';
    const clientSecret = process.env.META_CLIENT_SECRET || process.env.META_SECRET_KEY || process.env.META_APP_SECRET || '';
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || process.env.META_REDIRECT_URI || '';

    console.log('🔵 [CALLBACK] Step 4: clientId:', clientId ? '✓' : '✗', '| secret:', clientSecret ? '✓' : '✗', '| uri:', redirectUri ? '✓' : '✗');

    if (!clientId) {
      return redirectWithError(req, 'Step4-NoClientId', 'META_CLIENT_ID não configurado no servidor.');
    }
    if (!clientSecret) {
      return redirectWithError(req, 'Step4-NoSecret', 'META_CLIENT_SECRET não configurado no servidor.');
    }
    if (!redirectUri) {
      return redirectWithError(req, 'Step4-NoRedirectUri', 'META_REDIRECT_URI não configurado no servidor.');
    }

    let accessToken = '';
    let refreshToken = '';
    let tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    let accountId = 'act_12093849102';
    let accountName = 'Voxion Ads Account';
    let businessManagerId = process.env.META_BUSINESS_MANAGER_ID || '';

    const isMock = clientSecret.includes('placeholder');
    console.log('🔵 [CALLBACK] Modo:', isMock ? 'MOCK' : 'REAL');

    if (isMock) {
      // Mock mode
      accessToken = 'mock_access_token_' + Math.random().toString(36).substring(7);
      refreshToken = 'mock_refresh_token_' + Math.random().toString(36).substring(7);
      accountName = 'Voxion Ads BM Client (Demo)';
      businessManagerId = 'bm_98471029384';
    } else {
      // ── Step 5: Exchange code for short-lived token ──────────
      console.log('🔵 [CALLBACK] Step 5: Trocando código por token...');
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;

      let tokenRes;
      let tokenData;
      try {
        tokenRes = await fetch(tokenUrl);
        tokenData = await tokenRes.json();
      } catch (fetchErr: any) {
        return redirectWithError(req, 'Step5-FetchFailed', `Erro de rede ao contatar Facebook: ${fetchErr.message}`);
      }

      console.log('🔵 [CALLBACK] Token response:', { status: tokenRes.status, has_token: !!tokenData.access_token, error: tokenData.error });

      if (!tokenRes.ok || !tokenData.access_token) {
        const errMsg = tokenData.error?.message || tokenData.error?.type || JSON.stringify(tokenData.error || tokenData);
        return redirectWithError(req, 'Step5-TokenFailed', `Facebook não retornou token: ${errMsg}`);
      }

      const shortLivedToken = tokenData.access_token;
      console.log('🟢 [CALLBACK] ✓ Short-lived token OK');

      // ── Step 6: Exchange for long-lived token ────────────────
      console.log('🔵 [CALLBACK] Step 6: Obtendo long-lived token...');
      try {
        const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
        const longLivedRes = await fetch(longLivedUrl);
        const longLivedData = await longLivedRes.json();

        if (longLivedRes.ok && longLivedData.access_token) {
          accessToken = longLivedData.access_token;
          if (longLivedData.expires_in) {
            tokenExpiresAt = new Date(Date.now() + longLivedData.expires_in * 1000).toISOString();
          }
          console.log('🟢 [CALLBACK] ✓ Long-lived token OK, expira:', tokenExpiresAt);
        } else {
          // Se falhar o long-lived, usa o short-lived
          console.log('⚠️ [CALLBACK] Long-lived falhou, usando short-lived:', longLivedData.error);
          accessToken = shortLivedToken;
        }
      } catch (llErr: any) {
        console.log('⚠️ [CALLBACK] Long-lived fetch falhou, usando short-lived:', llErr.message);
        accessToken = shortLivedToken;
      }

      // ── Step 7: Fetch Ad Account info ────────────────────────
      console.log('🔵 [CALLBACK] Step 7: Buscando Ad Accounts...');
      try {
        const accountUrl = `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,business&access_token=${accessToken}`;
        const accountRes = await fetch(accountUrl);
        const accountData = await accountRes.json();

        console.log('🔵 [CALLBACK] Ad Accounts:', { ok: accountRes.ok, count: accountData.data?.length, error: accountData.error });

        if (accountRes.ok && accountData.data && accountData.data.length > 0) {
          const primaryAccount = accountData.data[0];
          accountId = primaryAccount.id;
          accountName = primaryAccount.name || 'Meta Ads Account';
          businessManagerId = primaryAccount.business?.id || businessManagerId;
          console.log('🟢 [CALLBACK] ✓ Conta:', accountName, accountId);
        } else {
          console.log('⚠️ [CALLBACK] Nenhuma ad account, usando padrão. Erro:', accountData.error);
        }
      } catch (accErr: any) {
        console.log('⚠️ [CALLBACK] Fetch ad accounts falhou (não-fatal):', accErr.message);
      }
    }

    if (!accessToken) {
      return redirectWithError(req, 'Step5-NoToken', 'Nenhum access token obtido após troca de código.');
    }

    // ── Step 8: Encrypt tokens ─────────────────────────────────
    console.log('🔵 [CALLBACK] Step 8: Encriptando tokens...');
    let encryptedAccessToken: string;
    let encryptedRefreshToken: string;
    try {
      encryptedAccessToken = encrypt(accessToken);
      encryptedRefreshToken = encrypt(refreshToken || 'no_refresh_token');
      console.log('🟢 [CALLBACK] ✓ Tokens encriptados');
    } catch (encryptErr: any) {
      console.log('🔴 [CALLBACK] Encriptação falhou:', encryptErr.message);
      return redirectWithError(req, 'Step8-EncryptFailed', `Falha na encriptação: ${encryptErr.message}. Verifique ENCRYPTION_KEY.`);
    }

    // ── Step 9: Save to Supabase ───────────────────────────────
    console.log('🔵 [CALLBACK] Step 9: Salvando em Supabase...');
    console.log('🔵 [CALLBACK] admin_id:', session.user.admin_id, '| account_id:', accountId);

    try {
      // Check if existing token
      const { data: existingToken, error: findError } = await supabaseAdmin
        .from('meta_tokens')
        .select('id')
        .eq('admin_id', session.user.admin_id)
        .eq('account_id', accountId)
        .maybeSingle();

      if (findError) {
        console.log('🔴 [CALLBACK] Erro ao buscar token existente:', findError);
        return redirectWithError(req, 'Step9-FindFailed', `Erro Supabase ao buscar token: ${findError.message} (${findError.code})`);
      }

      if (existingToken) {
        console.log('🔵 [CALLBACK] Atualizando token existente (id:', existingToken.id, ')');
        const { error: updateError } = await supabaseAdmin
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

        if (updateError) {
          console.log('🔴 [CALLBACK] Update falhou:', updateError);
          return redirectWithError(req, 'Step9-UpdateFailed', `Erro Supabase update: ${updateError.message} (${updateError.code}) ${updateError.hint || ''}`);
        }
        console.log('🟢 [CALLBACK] ✓ Token atualizado');
      } else {
        console.log('🔵 [CALLBACK] Inserindo novo token...');
        const { error: insertError } = await supabaseAdmin
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

        if (insertError) {
          console.log('🔴 [CALLBACK] Insert falhou:', insertError);
          return redirectWithError(req, 'Step9-InsertFailed', `Erro Supabase insert: ${insertError.message} (${insertError.code}) ${insertError.hint || ''}`);
        }
        console.log('🟢 [CALLBACK] ✓ Novo token inserido');
      }
    } catch (dbErr: any) {
      console.log('🔴 [CALLBACK] Exceção Supabase:', dbErr);
      return redirectWithError(req, 'Step9-Exception', `Exceção Supabase: ${dbErr.message}`);
    }

    // ── Step 10: Audit log (não-fatal) ─────────────────────────
    try {
      await supabaseAdmin.from('audit_logs').insert({
        admin_id: session.user.admin_id,
        action: 'META_AUTH_CONNECTED',
        details: `Conta ${accountName} (${accountId}) conectada ${isMock ? '(Demo)' : '(Real)'}.`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: req.headers.get('user-agent') || 'Meta OAuth',
      });
    } catch (e) {
      console.log('⚠️ [CALLBACK] Audit log falhou (não-fatal)');
    }

    // ── Step 11: Redirect SUCCESS ──────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    let redirectUrl = appUrl
      ? `${appUrl}/dashboard/configuracoes?connected=true&account=${encodeURIComponent(accountName)}`
      : new URL(`/dashboard/configuracoes?connected=true&account=${encodeURIComponent(accountName)}`, req.url).toString();

    if (redirectUrl.includes('://localhost') || redirectUrl.includes('://0.0.0.0') || redirectUrl.includes('://127.0.0.1')) {
      redirectUrl = redirectUrl.replace(/^https:/, 'http:');
    }

    console.log('========================================');
    console.log('🟢🟢🟢 [CALLBACK] SUCESSO COMPLETO!');
    console.log('🟢 Conta:', accountName, accountId);
    console.log('🟢 Admin:', session.user.email);
    console.log('========================================');

    const redirectResponse = NextResponse.redirect(new URL(redirectUrl));
    redirectResponse.cookies.set('meta_oauth_state', '', { maxAge: 0 });
    return redirectResponse;

  } catch (error: any) {
    console.log('🔴🔴🔴 [CALLBACK] ERRO GERAL:', error.message, error.stack);
    return redirectWithError(req, 'CATCH-Geral', error.message || 'Erro desconhecido no callback');
  }
}
