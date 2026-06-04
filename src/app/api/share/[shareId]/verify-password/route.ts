export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { encrypt } from '@/utils/crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request, { params }: { params: { shareId: string } }) {
  try {
    const { shareId } = params;
    const { password } = await req.json();

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // 1. Enforce Rate Limit: 5 failed attempts in 15 minutes
    let failedCount = 0;
    let fallbackToMockRateLimit = false;

    try {
      const { count, error } = await supabase
        .from('audit_logs')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'SHARE_LOGIN_FAILED')
        .eq('ip_address', ip)
        .like('details', `%link: ${shareId}%`)
        .gte('created_at', fifteenMinsAgo);

      if (error) {
        fallbackToMockRateLimit = true;
      } else {
        failedCount = count || 0;
      }
    } catch (err) {
      fallbackToMockRateLimit = true;
    }

    // Fallback rate limiting using global state
    if (fallbackToMockRateLimit) {
      const globalFailedAttempts = (global as any).mockFailedAttempts || [];
      const activeAttempts = globalFailedAttempts.filter(
        (a: any) =>
          a.ip === ip &&
          a.shareId === shareId &&
          new Date(a.timestamp) > new Date(Date.now() - 15 * 60 * 1000)
      );
      failedCount = activeAttempts.length;
      // Cleanup older elements
      (global as any).mockFailedAttempts = activeAttempts;
    }

    if (failedCount >= 5) {
      return NextResponse.json(
        { error: 'Muitas tentativas incorretas. Cooldown ativo. Tente novamente em 15 minutos.' },
        { status: 429 }
      );
    }

    // 2. Fetch the shared dashboard
    let share: any = null;
    let fallbackToMock = false;

    try {
      const { data, error } = await supabase
        .from('shared_dashboards')
        .select('*')
        .eq('id', shareId)
        .maybeSingle();

      if (error) {
        fallbackToMock = true;
      } else {
        share = data;
      }
    } catch (err) {
      fallbackToMock = true;
    }

    if (fallbackToMock || !share) {
      const globalShares = (global as any).mockShares || {};
      share = globalShares[shareId] || null;
    }

    if (!share) {
      return NextResponse.json({ error: 'Link de compartilhamento não encontrado.' }, { status: 404 });
    }

    if (!share.is_active) {
      return NextResponse.json({ error: 'Este link de compartilhamento foi desativado.' }, { status: 403 });
    }

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Este link de compartilhamento expirou.' }, { status: 403 });
    }

    // 3. Verify Password
    if (share.has_password && share.password_hash) {
      if (!password) {
        return NextResponse.json({ error: 'Senha é obrigatória.' }, { status: 400 });
      }

      const match = await bcrypt.compare(password, share.password_hash);

      if (!match) {
        // Log failure
        const detailsMsg = `Falha na verificação de senha para o link: ${shareId}`;
        try {
          await supabase.from('audit_logs').insert({
            action: 'SHARE_LOGIN_FAILED',
            details: detailsMsg,
            ip_address: ip,
          });
        } catch (dbErr) {
          // ignore insert errors
        }

        // Mock failed logs
        const globalFailedAttempts = (global as any).mockFailedAttempts || [];
        globalFailedAttempts.push({
          ip,
          shareId,
          timestamp: new Date().toISOString(),
        });
        (global as any).mockFailedAttempts = globalFailedAttempts;

        const remaining = 5 - (failedCount + 1);
        return NextResponse.json(
          {
            error: 'Senha incorreta.',
            remainingAttempts: Math.max(0, remaining),
          },
          { status: 401 }
        );
      }
    }

    // 4. Log Success
    try {
      await supabase.from('audit_logs').insert({
        action: 'SHARE_ACCESS_SUCCESS',
        details: `Acesso autorizado para o link: ${shareId}`,
        ip_address: ip,
      });
    } catch (dbErr) {
      // ignore
    }

    // 5. Generate secure session payload
    const sessionPayload = JSON.stringify({
      shareId,
      authenticatedAt: Date.now(),
    });
    const encryptedCookieValue = encrypt(sessionPayload);

    // Prepare response
    const response = NextResponse.json({ success: true, message: 'Autenticado com sucesso.' });
    
    // Cookie details
    const maxAge = share.expires_at 
      ? Math.floor((new Date(share.expires_at).getTime() - Date.now()) / 1000)
      : 7 * 24 * 60 * 60; // default 7 days in seconds

    response.cookies.set(`voxion_share_session_${shareId}`, encryptedCookieValue, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAge > 0 ? maxAge : undefined,
    });

    return response;

  } catch (error: any) {
    console.error('Verify Password API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
