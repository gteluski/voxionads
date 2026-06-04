import { redirect } from 'next/navigation';
import { validateShareSession } from '@/utils/share-auth';
import { ViewClient } from './view-client';

export const metadata = {
  title: 'Visualização de Dashboard - Voxion Ads',
  description: 'Visualização compartilhada e restrita do painel de métricas.',
};

export default async function ViewDashboardPage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;

  const { share, error } = await validateShareSession(shareId);

  if (error) {
    if (error === 'Não autorizado. Senha necessária.') {
      redirect(`/view/${shareId}/login`);
    }
    
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 border border-slate-900 bg-slate-900/20 backdrop-blur-md rounded-xl text-center space-y-4">
          <p className="text-red-400 text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return <ViewClient shareId={shareId} />;
}
