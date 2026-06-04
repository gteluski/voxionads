'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) { setError('Por favor, informe seu email.'); return; }
    if (!validateEmail(email)) { setError('Formato de email inválido.'); return; }
    if (!password) { setError('Por favor, informe sua senha.'); return; }
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return; }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Credenciais incorretas.');
      } else {
        setSuccess(true);
        setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 1200);
      }
    } catch {
      setError('Erro de conexão ou falha no servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--color-bg-darker)' }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(241,133,53,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{
              background: 'rgba(76,175,80,0.12)',
              border: '1px solid rgba(76,175,80,0.4)',
              color: '#4CAF50',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--fs-small)',
              fontWeight: 700,
            }}
          >
            <CheckCircle size={14} />
            Login efetuado! Redirecionando...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
        className="w-full max-w-sm"
        style={{
          background: 'var(--color-bg-dark)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), var(--shadow-orange)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/voxion-ads-logo.svg" alt="Voxion Ads" className="h-12 w-auto mb-2" />
          <p style={{ fontSize: 'var(--fs-small)', color: 'var(--color-accent-dim)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
            Área administrativa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                style={{
                  background: 'rgba(244,67,54,0.08)',
                  border: '1px solid rgba(244,67,54,0.3)',
                  fontSize: 'var(--fs-small)',
                  color: '#F44336',
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email-input"
              className="flex items-center gap-1.5 font-bold"
              style={{ fontSize: 'var(--fs-tiny)', color: 'var(--color-accent-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              <Mail size={11} style={{ color: 'var(--color-primary)' }} /> Email
            </label>
            <Input
              id="email-input"
              type="text"
              placeholder="admin@voxion.ads"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password-input"
              className="flex items-center gap-1.5 font-bold"
              style={{ fontSize: 'var(--fs-tiny)', color: 'var(--color-accent-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              <Lock size={11} style={{ color: 'var(--color-primary)' }} /> Senha
            </label>
            <Input
              id="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Submit */}
          <Button
            id="login-submit"
            type="submit"
            className="w-full mt-2 gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent vx-spin" />
                Conectando...
              </>
            ) : 'Acessar Sistema'}
          </Button>
        </form>

        {/* Hint */}
        <p
          className="text-center mt-5"
          style={{ fontSize: 'var(--fs-tiny)', fontFamily: 'var(--font-mono)', color: 'var(--color-accent-dim)' }}
        >
          demo: admin@voxion.ads / adminpassword
        </p>
      </motion.div>
    </div>
  );
}
