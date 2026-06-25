import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { encrypt } from '@/utils/crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Validar a sessão do administrador logado na plataforma
    const supabase = createClient(cookies());
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado. Faça login primeiro.' },
        { status: 401 }
      );
    }

    // Resolver adminId para evitar desalinhamento de IDs
    let adminId = user.id;
    if (user.email) {
      const { data: adminRecord } = await supabaseAdmin
        .from('admin_users')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();
      if (adminRecord?.id) {
        adminId = adminRecord.id;
      }
    }

    // 2. Extrair dados enviados pelo cliente
    const { accessToken, userID } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token do Meta ausente.' },
        { status: 400 }
      );
    }

    let accountId = 'act_12093849102'; // Fallback Padrão
    let accountName = 'Meta Ads Account';
    let businessManagerId = process.env.META_BUSINESS_MANAGER_ID || '';

    const isMock = accessToken.startsWith('mock_');

    if (!isMock) {
      // 3. Obter detalhes da conta de anúncios usando o Token recebido
      try {
        const accountUrl = `https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,business&access_token=${accessToken}`;
        const accountRes = await fetch(accountUrl);
        const accountData = await accountRes.json();

        if (accountRes.ok && accountData.data && accountData.data.length > 0) {
          const primaryAccount = accountData.data[0];
          accountId = primaryAccount.id;
          accountName = primaryAccount.name || 'Meta Ads Account';
          businessManagerId = primaryAccount.business?.id || businessManagerId;
        }
      } catch (err: any) {
        console.error('Erro ao consultar contas do Meta Ads:', err.message);
      }
    } else {
      accountName = 'Voxion Ads BM Client (Demo)';
      businessManagerId = 'bm_98471029384';
    }

    // 4. Encriptar o token de acesso de forma segura
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt('no_refresh_token');
    const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 dias

    // 5. Salvar ou atualizar no banco de dados Supabase
    const { data: existingToken, error: findError } = await supabaseAdmin
      .from('meta_tokens')
      .select('id')
      .eq('admin_id', adminId)
      .eq('account_id', accountId)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (existingToken) {
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
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('meta_tokens')
        .insert({
          admin_id: adminId,
          access_token: encryptedAccessToken,
          refresh_token: encryptedRefreshToken,
          token_expires_at: tokenExpiresAt,
          account_id: accountId,
          account_name: accountName,
          business_manager_id: businessManagerId,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    // Registrar log de auditoria
    try {
      await supabaseAdmin.from('audit_logs').insert({
        admin_id: adminId,
        action: 'META_ACCOUNT_CONNECTED',
        details: `Conta ${accountName} (${accountId}) conectada de forma segura pelo cliente.`,
        ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
        user_agent: req.headers.get('user-agent') || 'Client Meta SDK Link',
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Conta conectada com sucesso.',
      accountName,
      accountId
    });

  } catch (error: any) {
    console.error('Save Meta Token API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro inesperado ao salvar token.' },
      { status: 500 }
    );
  }
}
