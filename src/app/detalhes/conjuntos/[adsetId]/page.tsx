import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AdsetDetailsClient } from './adset-details-client';

export const metadata = {
  title: 'Detalhes do Conjunto - Voxion Ads',
  description: 'Métricas diárias do conjunto de anúncios, anúncios vinculados e otimizações.',
};

export default async function AdsetDetailsPage({
  params,
}: {
  params: { adsetId: string };
}) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  return <AdsetDetailsClient adsetId={params.adsetId} />;
}
