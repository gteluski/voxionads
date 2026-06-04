import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  return <AdsetDetailsClient adsetId={params.adsetId} />;
}
