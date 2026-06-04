import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  return <CampaignDetailsClient campaignId={params.campaignId} />;
}
