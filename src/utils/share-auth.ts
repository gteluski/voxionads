import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/utils/crypto';

export interface ValidatedShareSession {
  share: any;
  error?: string;
  status?: number;
}

export async function validateShareSession(shareId: string): Promise<ValidatedShareSession> {
  let share: any = null;
  let fallbackToMock = false;

  // 1. Retrieve the share configuration
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
    return { share: null, error: 'Compartilhamento não encontrado.', status: 404 };
  }

  if (!share.is_active) {
    return { share: null, error: 'Este link de compartilhamento foi desativado.', status: 403 };
  }

  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return { share: null, error: 'Este link de compartilhamento expirou.', status: 403 };
  }

  // 2. Validate password session cookie if enabled
  if (share.has_password) {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(`voxion_share_session_${shareId}`)?.value;

    if (!sessionCookie) {
      return { share: null, error: 'Não autorizado. Senha necessária.', status: 401 };
    }

    try {
      const decrypted = decrypt(sessionCookie);
      const parsed = JSON.parse(decrypted);

      if (parsed.shareId !== shareId) {
        return { share: null, error: 'Sessão inválida.', status: 401 };
      }
    } catch (err) {
      return { share: null, error: 'Erro ao validar sessão.', status: 401 };
    }
  }

  return { share };
}
