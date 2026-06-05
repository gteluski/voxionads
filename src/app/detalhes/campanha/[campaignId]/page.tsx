import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { CampaignDetailsClient } from './campaign-details-client';

export const metadata = {
  title: 'Detalhes da Campanha - Voxion Ads',
  description: 'Métricas diárias, conjuntos de anúncios associados e recomendações.',
};

export default async function CampaignDetailsPage({
  params,
}: {
  params: { campaignId: string };
}) {
  const supabase = createClient(cookies());
  const { data: { user } } = await supabase.auth.getUser();
  const session = user ? { user: { admin_id: user.id, email: user.email, name: user.user_metadata?.name || 'Admin' } } : null;

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  return <CampaignDetailsClient campaignId={params.campaignId} />;
}
