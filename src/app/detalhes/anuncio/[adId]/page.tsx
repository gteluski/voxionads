import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  return <AdDetailsClient adId={params.adId} />;
}
