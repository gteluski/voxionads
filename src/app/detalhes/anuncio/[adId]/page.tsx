import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AdDetailsClient } from './ad-details-client';

export const metadata = {
  title: 'Detalhes do Anúncio - Voxion Ads',
  description: 'Métricas diárias individuais do criativo, CTR e ROI.',
};

export default async function AdDetailsPage({
  params,
}: {
  params: { adId: string };
}) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  return <AdDetailsClient adId={params.adId} />;
}
