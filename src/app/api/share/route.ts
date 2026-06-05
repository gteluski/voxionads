import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    let shares: any[] = [];
    let fallbackToMock = false;

    try {
      const { data, error } = await supabase
        .from('shared_dashboards')
        .select('*')
        .eq('admin_id', session.user.admin_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Database select failed, using mock fallback.', error);
        fallbackToMock = true;
      } else {
        shares = data || [];
      }
    } catch (err) {
      console.warn('Database threw error, using mock fallback.', err);
      fallbackToMock = true;
    }

    // In demo environment or fallback, load from global mock state
    if (fallbackToMock || shares.length === 0) {
      const globalShares = (global as any).mockShares || {};
      const allMockShares = Object.values(globalShares).filter(
        (s: any) => s.admin_id === session.user.admin_id
      );

      // Seed a default mock share if list is completely empty just for preview
      if (allMockShares.length === 0 && !fallbackToMock) {
        shares = [];
      } else {
        shares = allMockShares;
      }
    }

    // Sanitize output (don't expose password hashes to lists)
    const sanitized = shares.map((s) => {
      const { password_hash, ...rest } = s;
      return rest;
    });

    return NextResponse.json({ shares: sanitized });
  } catch (error: any) {
    console.error('Share List API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
