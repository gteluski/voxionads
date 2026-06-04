'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setToastMessage(null);

    // Form validations
    if (!email) {
      setError('Por favor, informe seu email.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor, digite um formato de email válido.');
      return;
    }

    if (!password) {
      setError('Por favor, informe sua senha.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      // Call custom api endpoint for admin login (POST /api/auth/admin/login)
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciais incorretas.');
      } else {
        // Show success toast notification
        setToastMessage('Login efetuado com sucesso! Redirecionando...');
        
        // Wait 1.5 seconds for visual feedback, then redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1200);
      }
    } catch (err) {
      setError('Erro de conexão ou falha no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-xs px-4 py-3 rounded-lg shadow-xl shadow-emerald-950/40 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-350">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Card className="bg-glass glow-indigo border-slate-800 text-slate-100 shadow-2xl transition-all duration-300 hover:border-slate-700">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white font-black text-xl shadow-lg shadow-indigo-500/20">
              V
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
            Voxion Ads Admin
          </h1>
          <p className="text-xs text-slate-400">
            Autenticação Administrativa
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-950/50 border border-red-800 p-3 text-xs text-red-400 animate-in fade-in zoom-in duration-200">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="email-input">
                Email
              </label>
              <Input
                id="email-input"
                type="text"
                placeholder="admin@voxion.ads"
                className="bg-slate-900/50 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-indigo-500 focus-visible:border-slate-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300" htmlFor="password-input">
                Senha
              </label>
              <Input
                id="password-input"
                type="password"
                placeholder="••••••••"
                className="bg-slate-900/50 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-indigo-500 focus-visible:border-slate-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button
              id="login-submit"
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold transition-all hover:opacity-90 shadow-md shadow-indigo-500/10 active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Conectando...
                </span>
              ) : (
                'Acessar Sistema'
              )}
            </Button>
            
            <div className="text-[10px] text-center text-slate-500 mt-2">
              Credenciais padrão: <span className="font-mono text-slate-400">admin@voxion.ads / adminpassword</span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
