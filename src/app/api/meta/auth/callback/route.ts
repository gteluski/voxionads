import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin, ensureAdminUserExists } from '@/lib/supabase/admin';
import { encrypt } from '@/utils/crypto';

export async function GET(req: Request) {
  console.log('========================================');
  console.log('🔵 [CALLBACK] Iniciado');
  console.log('🔵 [CALLBACK] URL:', req.url);
  console.log('========================================');

  try {
    // ── Step 1: Authenticate user ──────────────────────────────
    console.log('🔵 [CALLBACK] Step 1: Autenticando usuário via Supabase Auth...');
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();

    console.log('🔵 [CALLBACK] Usuário Auth:', {
      found: !!user,
      id: user?.id?.substring(0, 8) + '...',
      email: user?.email,
    });

    if (user && user.email) {
      console.log('🔵 [CALLBACK] Garantindo admin_users existe...');
      await ensureAdminUserExists(user.id, user.email, user.user_metadata?.name);
      console.log('🟢 [CALLBACK] ✓ ensureAdminUserExists OK');
    }

    let realAdminId = user?.id;
    if (user?.email) {
      const { data: adminRecord } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      if (adminRecord?.id) {
        realAdminId = adminRecord.id;
      }
      console.log('🔵 [CALLBACK] realAdminId:', realAdminId?.substring(0, 8) + '...');
    }

    const session = user ? { user: { admin_id: realAdminId, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user) {
      console.log('🔴 [CALLBACK] ERRO: Usuário não autenticado - sessão nula');
      return NextResponse.json(
        { error: 'Não autorizado. Inicie sessão administrativamente.' },
        { status: 401 }
      );
    }
    console.log('🟢 [CALLBACK] ✓ Sessão autenticada:', session.user.email);

    // ── Step 2: Extract query params ───────────────────────────
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('🔵 [CALLBACK] Step 2: Parâmetros da URL:', {
      code: code ? `✓ Recebido (${code.substring(0, 15)}...)` : '✗ FALTA',
      state: state ? `✓ Recebido (${state.substring(0, 15)}...)` : '✗ FALTA',
    });

    // ── Step 3: Validate CSRF state ────────────────────────────
    console.log('🔵 [CALLBACK] Step 3: Validando state (CSRF)...');
    const cookieState = req.headers.get('cookie')
      ?.split(';')
      .find(c => c.trim().startsWith('meta_oauth_state='))
      ?.split('=')[1];

    console.log('🔵 [CALLBACK] Cookie state:', cookieState ? `✓ (${cookieState.substring(0, 15)}...)` : '✗ NÃO ENCONTRADO');
    console.log('🔵 [CALLBACK] URL state:', state ? `✓ (${state.substring(0, 15)}...)` : '✗ NÃO ENCONTRADO');
    console.log('🔵 [CALLBACK] States match?', state === cookieState);

    if (!state || state !== cookieState) {
      console.log('🔴 [CALLBACK] ERRO: State inválido ou cookie expirado');
      console.log('🔴 [CALLBACK] Possíveis causas:');
      console.log('  1. Cookie meta_oauth_state expirou (>10min)');
      console.log('  2. SameSite=lax bloqueou cookie em cross-origin redirect');
      console.log('  3. Redirect URI muda de domínio (http vs https)');
      return NextResponse.json(
        { error: 'Parâmetro de estado inválido ou cookies expirados.' },
        { status: 400 }
      );
    }
    console.log('🟢 [CALLBACK] ✓ State validado (CSRF OK)');

    if (!code) {
      console.log('🔴 [CALLBACK] ERRO: Código de autorização ausente');
      return NextResponse.json(
        { error: 'Código de autorização ausente.' },
        { status: 400 }
      );
    }
    console.log('🟢 [CALLBACK] ✓ Código de autorização presente');

    // ── Step 4: Prepare credentials ────────────────────────────
    const clientId = process.env.NEXT_PUBLIC_META_CLIENT_ID || process.env.META_CLIENT_ID || process.env.META_APP_ID || '';
    const clientSecret = process.env.META_CLIENT_SECRET || process.env.META_SECRET_KEY || process.env.META_APP_SECRET || '';
    const redirectUri = process.env.NEXT_PUBLIC_META_REDIRECT_URI || process.env.META_REDIRECT_URI || '';

    console.log('🔵 [CALLBACK] Step 4: Credenciais:', {
      clientId: clientId ? `✓ (${clientId.substring(0, 8)}...)` : '✗ FALTA',
      clientSecret: clientSecret ? `✓ (${clientSecret.substring(0, 4)}****)` : '✗ FALTA',
      redirectUri: redirectUri || '✗ FALTA',
    });

    let accessToken = 'mock_access_token_' + Math.random().toString(36).substring(7);
    let refreshToken = 'mock_refresh_token_' + Math.random().toString(36).substring(7);
    let tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days standard Meta long-lived
    let accountId = 'act_12093849102';
    let accountName = 'Voxion Ads BM Client';
    let businessManagerId = 'bm_98471029384';

    const isMock = !clientSecret || clientSecret.includes('placeholder');
    console.log('🔵 [CALLBACK] Modo:', isMock ? '⚠️ MOCK (clientSecret ausente)' : '🔑 REAL (produção)');

    if (!isMock) {
      // ── Step 5: Exchange code for short-lived token ──────────
      console.log('🔵 [CALLBACK] Step 5: Trocando código por short-lived token...');
      const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&client_secret=${clientSecret}&code=${code}`;

      console.log('🔵 [CALLBACK] Token URL (sem secret):', tokenUrl.replace(clientSecret, '****'));

      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      console.log('🔵 [CALLBACK] Resposta Token:', {
        status: tokenRes.status,
        ok: tokenRes.ok,
        has_access_token: !!tokenData.access_token,
        has_error: !!tokenData.error,
        error: tokenData.error,
        error_message: tokenData.error?.message,
      });

      if (!tokenRes.ok) {
        console.log('🔴 [CALLBACK] ERRO: Falha ao trocar código pelo token');
        console.log('🔴 [CALLBACK] Detalhes:', JSON.stringify(tokenData, null, 2));
        throw new Error(tokenData.error?.message || 'Falha ao trocar código pelo token de acesso.');
      }

      const shortLivedToken = tokenData.access_token;
      console.log('🟢 [CALLBACK] ✓ Short-lived token recebido');

      // ── Step 6: Exchange for long-lived token ────────────────
      console.log('🔵 [CALLBACK] Step 6: Trocando por long-lived token (60 dias)...');
      const longLivedUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`;
      const longLivedRes = await fetch(longLivedUrl);
      const longLivedData = await longLivedRes.json();

      console.log('🔵 [CALLBACK] Resposta Long-lived:', {
        status: longLivedRes.status,
        ok: longLivedRes.ok,
        has_access_token: !!longLivedData.access_token,
        expires_in: longLivedData.expires_in,
        has_error: !!longLivedData.error,
        error: longLivedData.error,
      });

      if (!longLivedRes.ok) {
        console.log('🔴 [CALLBACK] ERRO: Falha ao obter long-lived token');
        throw new Error(longLivedData.error?.message || 'Falha ao obter token de longa duração.');
      }

      accessToken = longLivedData.access_token;
      if (longLivedData.expires_in) {
        tokenExpiresAt = new Date(Date.now() + longLivedData.expires_in * 1000).toISOString();
      }
      console.log('🟢 [CALLBACK] ✓ Long-lived token recebido, expira em:', tokenExpiresAt);

      // ── Step 7: Fetch Ad Account info ────────────────────────
      console.log('🔵 [CALLBACK] Step 7: Buscando Ad Accounts...');
      const accountUrl = `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,business&access_token=${accessToken}`;
      const accountRes = await fetch(accountUrl);
      const accountData = await accountRes.json();

      console.log('🔵 [CALLBACK] Resposta Ad Accounts:', {
        status: accountRes.status,
        ok: accountRes.ok,
        has_data: !!accountData.data,
        count: accountData.data?.length,
        accounts: accountData.data?.map((a: any) => ({ id: a.id, name: a.name })),
        error: accountData.error,
      });

      if (accountRes.ok && accountData.data && accountData.data.length > 0) {
        const primaryAccount = accountData.data[0];
        accountId = primaryAccount.id;
        accountName = primaryAccount.name;
        businessManagerId = primaryAccount.business?.id || '';
        console.log('🟢 [CALLBACK] ✓ Conta primária:', { accountId, accountName, businessManagerId });
      } else {
        console.log('⚠️ [CALLBACK] Nenhuma ad account encontrada, usando valores padrão');
      }
    }

    // ── Step 8: Encrypt tokens ─────────────────────────────────
    console.log('🔵 [CALLBACK] Step 8: Encriptando tokens...');
    console.log('🔵 [CALLBACK] ENCRYPTION_KEY presente?', !!process.env.ENCRYPTION_KEY);
    console.log('🔵 [CALLBACK] NEXTAUTH_SECRET presente?', !!process.env.NEXTAUTH_SECRET);

    let encryptedAccessToken: string;
    let encryptedRefreshToken: string;
    try {
      encryptedAccessToken = encrypt(accessToken);
      encryptedRefreshToken = encrypt(refreshToken);
      console.log('🟢 [CALLBACK] ✓ Tokens encriptados com sucesso');
    } catch (encryptErr: any) {
      console.log('🔴 [CALLBACK] ERRO na encriptação:', encryptErr.message);
      console.log('🔴 [CALLBACK] Stack:', encryptErr.stack);
      throw encryptErr;
    }

    // ── Step 9: Save to Supabase ───────────────────────────────
    console.log('🔵 [CALLBACK] Step 9: Salvando em Supabase...');
    console.log('🔵 [CALLBACK] admin_id:', session.user.admin_id);
    console.log('🔵 [CALLBACK] account_id:', accountId);

    // Check if existing token
    console.log('🔵 [CALLBACK] Verificando token existente...');
    const { data: existingToken, error: findError } = await supabaseAdmin
      .from('meta_tokens')
      .select('id')
      .eq('admin_id', session.user.admin_id)
      .eq('account_id', accountId)
      .maybeSingle();

    if (findError) {
      console.log('🔴 [CALLBACK] ERRO ao buscar token existente:', {
        message: findError.message,
        code: findError.code,
        details: findError.details,
        hint: findError.hint,
      });
    }

    console.log('🔵 [CALLBACK] Token existente?', existingToken ? `✓ ID: ${existingToken.id}` : '✗ Nenhum (inserir novo)');

    if (existingToken) {
      console.log('🔵 [CALLBACK] Atualizando token existente...');
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
        console.log('🔴 [CALLBACK] ERRO ao atualizar Supabase:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint,
        });
        throw updateError;
      }
      console.log('🟢 [CALLBACK] ✓ Token atualizado no Supabase');
    } else {
      console.log('🔵 [CALLBACK] Inserindo novo token...');
      const insertPayload = {
        admin_id: session.user.admin_id,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: tokenExpiresAt,
        account_id: accountId,
        account_name: accountName,
        business_manager_id: businessManagerId,
      };
      console.log('🔵 [CALLBACK] Payload insert:', {
        admin_id: insertPayload.admin_id,
        account_id: insertPayload.account_id,
        account_name: insertPayload.account_name,
        has_access_token: !!insertPayload.access_token,
        has_refresh_token: !!insertPayload.refresh_token,
      });

      const { error: insertError } = await supabaseAdmin
        .from('meta_tokens')
        .insert(insertPayload);

      if (insertError) {
        console.log('🔴 [CALLBACK] ERRO ao inserir Supabase:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });
        throw insertError;
      }
      console.log('🟢 [CALLBACK] ✓ Novo token inserido no Supabase');
    }

    // ── Step 10: Audit log ─────────────────────────────────────
    console.log('🔵 [CALLBACK] Step 10: Registrando em audit_logs...');
    const { error: auditError } = await supabaseAdmin.from('audit_logs').insert({
      admin_id: session.user.admin_id,
      action: 'META_AUTH_CONNECTED',
      details: `Conta de anúncios Meta ${accountName} (${accountId}) conectada ${isMock ? '(Modo Demo)' : '(Real)'}.`,
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent') || 'Meta OAuth Callback',
    });

    if (auditError) {
      console.log('⚠️ [CALLBACK] Erro ao salvar audit_log (não-fatal):', auditError.message);
    } else {
      console.log('🟢 [CALLBACK] ✓ Audit log registrado');
    }

    // ── Step 11: Redirect to success ───────────────────────────
    console.log('🔵 [CALLBACK] Step 11: Preparando redirect de sucesso...');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
    let redirectUrl = appUrl 
      ? new URL('/dashboard/configuracoes?connected=true', appUrl) 
      : new URL('/dashboard/configuracoes?connected=true', req.url);

    let redirectUrlStr = redirectUrl.toString();
    // Prevent SSL protocol error on local dev hosts
    if (redirectUrlStr.includes('://localhost') || redirectUrlStr.includes('://0.0.0.0') || redirectUrlStr.includes('://127.0.0.1')) {
      redirectUrlStr = redirectUrlStr.replace(/^https:/, 'http:');
    }

    console.log('🔵 [CALLBACK] Redirect URL:', redirectUrlStr);

    const redirectResponse = NextResponse.redirect(new URL(redirectUrlStr));
    redirectResponse.cookies.set('meta_oauth_state', '', { maxAge: 0 });

    console.log('========================================');
    console.log('🟢🟢🟢 [CALLBACK] SUCESSO COMPLETO!');
    console.log('🟢 Conta:', accountName, '(' + accountId + ')');
    console.log('🟢 Admin:', session.user.email);
    console.log('🟢 Modo:', isMock ? 'Demo' : 'Produção');
    console.log('========================================');

    return redirectResponse;
  } catch (error: any) {
    console.log('========================================');
    console.log('🔴🔴🔴 [CALLBACK] ERRO NA EXECUÇÃO!');
    console.log('🔴 [CALLBACK] Mensagem:', error.message || 'Erro desconhecido');
    console.log('🔴 [CALLBACK] Stack:', error.stack);
    console.log('🔴 [CALLBACK] Objeto:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.log('========================================');
    
    // Log failures to sync_log/audit_logs
    try {
      const supabase = createClient(cookies());
      const { data: { user } } = await supabase.auth.getUser();
      
      let realAdminId = user?.id;
      if (user?.email) {
        const { data: adminRecord } = await supabaseAdmin.from('admin_users').select('id').eq('email', user.email).maybeSingle();
        if (adminRecord?.id) {
          realAdminId = adminRecord.id;
        }
      }
      
      if (realAdminId) {
        await supabaseAdmin.from('sync_log').insert({
          admin_id: realAdminId,
          status: 'ERROR',
          message: `Falha no callback Meta OAuth: ${error.message || 'Erro desconhecido'}`,
          synced_at: new Date().toISOString(),
          duration_ms: 0
        });
        console.log('🔵 [CALLBACK] Erro registrado em sync_log');
      }
    } catch (logErr) {
      console.error('🔴 [CALLBACK] Falhou ao gravar log de erro:', logErr);
    }

    return NextResponse.json(
      { error: `Erro no callback de autenticação: ${error.message || 'Erro interno'}` },
      { status: 500 }
    );
  }
}
