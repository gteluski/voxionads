import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { supabaseAdmin as supabase } from '@/lib/supabase/admin';
import bcrypt from 'bcryptjs';

// GET /api/share/[shareId] - Retrieves public details of a shared dashboard link
export async function GET(req: Request, { params }: { params: { shareId: string } }) {
  try {
    const { shareId } = params;

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

    return NextResponse.json({
      id: share.id,
      share_name: share.share_name,
      business_manager_id: share.business_manager_id,
      has_password: share.has_password,
      expires_at: share.expires_at,
    });

  } catch (error: any) {
    console.error('Share Detail API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// DELETE /api/share/[shareId] - Deletes a shared dashboard link
export async function DELETE(req: Request, { params }: { params: { shareId: string } }) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { shareId } = params;

    let success = false;
    let dbError: any = null;

    try {
      const { error } = await supabase
        .from('shared_dashboards')
        .delete()
        .eq('id', shareId)
        .eq('admin_id', session.user.admin_id);

      if (error) {
        dbError = error;
      } else {
        success = true;
      }
    } catch (err) {
      dbError = err;
    }

    // Fallback or delete from global mock state
    const globalShares = (global as any).mockShares || {};
    if (globalShares[shareId]) {
      if (globalShares[shareId].admin_id === session.user.admin_id) {
        delete globalShares[shareId];
        (global as any).mockShares = globalShares;
        success = true;
      } else {
        return NextResponse.json({ error: 'Não autorizado para deletar este link.' }, { status: 403 });
      }
    }

    if (!success && dbError) {
      console.error('Delete database share failed:', dbError);
      return NextResponse.json({ error: 'Falha ao remover compartilhamento no banco de dados.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Compartilhamento removido com sucesso.' });

  } catch (error: any) {
    console.error('Share Delete API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

// PATCH /api/share/[shareId] - Edits a shared dashboard link
export async function PATCH(req: Request, { params }: { params: { shareId: string } }) {
  try {
    const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;
    if (!session || !session.user || !session.user.admin_id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { shareId } = params;
    const {
      share_name,
      expires_at,
      password,
      campaign_ids,
      is_active,
    } = await req.json();

    const updateFields: any = {};
    if (share_name !== undefined) {
      if (!share_name) {
        return NextResponse.json({ error: 'O nome do compartilhamento é obrigatório.' }, { status: 400 });
      }
      updateFields.share_name = share_name;
    }
    if (expires_at !== undefined) updateFields.expires_at = expires_at ? new Date(expires_at).toISOString() : null;
    if (password !== undefined) {
      updateFields.password_hash = password ? await bcrypt.hash(password, 10) : null;
      updateFields.has_password = !!password;
    }
    if (campaign_ids !== undefined) updateFields.campaign_ids = campaign_ids || [];
    if (is_active !== undefined) updateFields.is_active = is_active;

    let updatedShare: any = null;
    let dbSuccess = false;
    let dbError: any = null;

    try {
      const { data, error } = await supabase
        .from('shared_dashboards')
        .update(updateFields)
        .eq('id', shareId)
        .eq('admin_id', session.user.admin_id)
        .select('*')
        .single();

      if (error) {
        dbError = error;
      } else {
        updatedShare = data;
        dbSuccess = true;
      }
    } catch (err) {
      dbError = err;
    }

    // Fallback mock simulation
    const isDemo = !process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder');
    if (isDemo || !dbSuccess) {
      const globalShares = (global as any).mockShares || {};
      if (globalShares[shareId] && globalShares[shareId].admin_id === session.user.admin_id) {
        const existing = globalShares[shareId];
        const newMockShare = {
          ...existing,
          ...updateFields,
          updated_at: new Date().toISOString(),
        };
        globalShares[shareId] = newMockShare;
        (global as any).mockShares = globalShares;

        updatedShare = newMockShare;
        dbSuccess = true;
      }
    }

    if (!dbSuccess || !updatedShare) {
      return NextResponse.json({ error: 'Compartilhamento não encontrado ou falha ao atualizar.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      share: updatedShare,
    });

  } catch (error: any) {
    console.error('Share Patch API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}
