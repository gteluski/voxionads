'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, ShieldAlert, Key } from 'lucide-react';

interface LoginClientProps {
  shareId: string;
  shareName: string;
}

export function LoginClient({ shareId, shareName }: LoginClientProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/share/${shareId}/verify-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Authenticated, redirect to read-only dashboard
        router.push(`/view/${shareId}`);
        router.refresh();
      } else {
        if (res.status === 429) {
          setErrorMsg('Muitas tentativas incorretas. Acesso bloqueado por 15 minutos.');
          setRemainingAttempts(0);
        } else {
          setErrorMsg(data.error || 'Senha incorreta.');
          if (data.remainingAttempts !== undefined) {
            setRemainingAttempts(data.remainingAttempts);
          }
        }
      }
    } catch (err) {
      setErrorMsg('Falha ao se conectar ao servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center relative overflow-hidden p-4">
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[150px] pointer-events-none" />

      <Card className="max-w-md w-full border-slate-900 bg-slate-900/20 backdrop-blur-md relative z-10 p-2">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/15">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-bold text-white tracking-tight">
            Dashboard Protegido
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            O painel <span className="font-semibold text-slate-200">{shareName}</span> requer uma senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-3 text-red-400 text-xs flex gap-2 items-start">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{errorMsg}</p>
                  {remainingAttempts !== null && remainingAttempts > 0 && (
                    <p className="font-medium text-[10px] text-red-400/80">
                      Você ainda tem {remainingAttempts} tentativa{remainingAttempts > 1 ? 's' : ''} antes do bloqueio.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Senha de Acesso</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || (remainingAttempts === 0 && errorMsg.includes('bloqueado'))}
                  required
                  className="bg-slate-950 border-slate-800 text-xs h-9 pl-9 pr-10 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || (remainingAttempts === 0 && errorMsg.includes('bloqueado'))}
              className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 hover:opacity-95 text-white font-bold text-xs h-9 transition-all"
            >
              {loading ? 'Acessando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
