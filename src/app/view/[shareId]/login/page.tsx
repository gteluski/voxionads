import { redirect } from 'next/navigation';
import { validateShareSession } from '@/utils/share-auth';
import { LoginClient } from './login-client';

export const metadata = {
  title: 'Acesso Restrito - Voxion Ads',
  description: 'Digite a senha para acessar este dashboard.',
};

export default async function ViewLoginPage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;

  // Validate the link exists, is active and not expired
  // Ignore cookie session checks for the login screen itself
  let share: any = null;
  let errorMsg = '';

  try {
    const { share: validatedShare, error } = await validateShareSession(shareId);
    if (error && error !== 'Não autorizado. Senha necessária.') {
      errorMsg = error;
    } else {
      share = validatedShare;
    }
  } catch (err) {
    errorMsg = 'Erro ao validar link de compartilhamento.';
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 border border-slate-900 bg-slate-900/20 backdrop-blur-md rounded-xl text-center space-y-4">
          <p className="text-red-400 text-sm font-semibold">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // If the share exists and does not require a password, redirect immediately
  if (share && !share.has_password) {
    redirect(`/view/${shareId}`);
  }

  return <LoginClient shareId={shareId} shareName={share?.share_name || 'Dashboard Compartilhado'} />;
}
