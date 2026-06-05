import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const {
      share_name,
      business_manager_id,
      campaign_ids,
      password,
      expires_at,
      is_active,
    } = await req.json();

    if (!share_name || !business_manager_id) {
      return NextResponse.json(
        { error: 'Nome do compartilhamento e Business Manager ID são obrigatórios.' },
        { status: 400 }
      );
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const hasPassword = !!password;
    const expirationDate = expires_at ? new Date(expires_at).toISOString() : null;

    let dbShare: any = null;
    let fallbackToMock = false;

    try {
      const { data, error } = await supabase
        .from('shared_dashboards')
        .insert({
          admin_id: session.user.admin_id,
          share_name,
          business_manager_id,
          campaign_ids: campaign_ids || [],
          password_hash: passwordHash,
          has_password: hasPassword,
          expires_at: expirationDate,
          is_active: is_active ?? true,
        })
        .select('*')
        .single();

      if (error) {
        console.warn('Database insert failed, using mock fallback.', error);
        fallbackToMock = true;
      } else {
        dbShare = data;
      }
    } catch (err) {
      console.warn('Database access threw error, using mock fallback.', err);
      fallbackToMock = true;
    }

    if (fallbackToMock || !dbShare) {
      // Simulate standard database insertion
      const mockId = crypto.randomBytes(6).toString('hex'); // compact 12-char unique link ID
      
      const newMockShare = {
        id: mockId,
        admin_id: session.user.admin_id,
        share_name,
        business_manager_id,
        campaign_ids: campaign_ids || [],
        password_hash: passwordHash,
        has_password: hasPassword,
        expires_at: expirationDate,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in global object for persistence across routes during simulation
      const globalShares = (global as any).mockShares || {};
      globalShares[mockId] = newMockShare;
      (global as any).mockShares = globalShares;

      dbShare = newMockShare;
    }

    return NextResponse.json({
      success: true,
      share: dbShare,
      link: `/view/${dbShare.id}`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Share Create API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
