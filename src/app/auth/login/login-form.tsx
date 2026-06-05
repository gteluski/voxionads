'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login, loading: authLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || authError;
  const isLoading = authLoading;

  const validateEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email) { setLocalError('Por favor, informe seu email.'); return; }
    if (!validateEmail(email)) { setLocalError('Formato de email inválido.'); return; }
    if (!password) { setLocalError('Por favor, informe sua senha.'); return; }
    if (password.length < 6) { setLocalError('A senha deve ter no mínimo 6 caracteres.'); return; }

    try {
      await login(email, password);
      setSuccess(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Credenciais incorretas.');
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, var(--color-bg-darker) 100%)',
      }}
    >
      {/* Decorative Orbs */}
      <div
        className="pointer-events-none absolute rounded-full z-0"
        style={{
          width: '400px',
          height: '400px',
          top: '-100px',
          left: '-100px',
          filter: 'blur(80px)',
          background: 'radial-gradient(circle, rgba(241, 133, 53, 0.15), transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full z-0"
        style={{
          width: '300px',
          height: '300px',
          bottom: '-50px',
          right: '-50px',
          filter: 'blur(60px)',
          background: 'radial-gradient(circle, rgba(241, 133, 53, 0.15), transparent)',
        }}
      />

      <div className="z-10 w-full flex flex-col items-center max-w-[400px]">
        {/* Header Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center mb-10"
        >
          <img src="/voxion-ads-logo.svg" alt="Voxion Ads" className="h-32 w-auto mb-6 drop-shadow-xl" />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--color-accent)', opacity: 0.9 }}>
            Painel Administrativo
          </p>
        </motion.div>

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

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full relative group"
          style={{
            background: 'var(--color-bg-dark)',
            border: '2px solid rgba(216, 197, 182, 0.2)',
            borderRadius: '16px',
            padding: '48px 40px',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.3), 0 0 40px rgba(241, 133, 53, 0.1)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(216, 197, 182, 0.4)';
            e.currentTarget.style.boxShadow = '0 30px 35px rgba(0, 0, 0, 0.4), 0 0 60px rgba(241, 133, 53, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(216, 197, 182, 0.2)';
            e.currentTarget.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.3), 0 0 40px rgba(241, 133, 53, 0.1)';
          }}
        >
          {/* Internal Logo */}
          <div className="flex flex-col items-center mb-6">
            <img src="/v-voxion.svg" alt="V Logo" className="w-12 h-12 mb-6" />
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '8px' }}>
              VOXIONads
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-accent)', opacity: 0.6, marginBottom: '8px' }}>
              Painel administrativo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid #F44336',
                  }}
                >
                  <AlertCircle size={18} style={{ color: '#F44336', flexShrink: 0 }} />
                  <span style={{ color: 'var(--color-accent)', fontSize: '13px', fontFamily: 'var(--font-heading)' }}>
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="space-y-2"
            >
              <label
                htmlFor="email-input"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Email
              </label>
              <Input
                id="email-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full bg-[#f5f5f5] text-[#31251f] border-[#d8c5b6] focus:border-[#f18535] focus:ring-4 focus:ring-[rgba(241,133,53,0.15)] focus-visible:ring-offset-0 focus-visible:ring-[rgba(241,133,53,0.15)] placeholder:text-[#31251f]/50 h-12 rounded-lg font-['Avenir'] text-[14px] transition-all duration-300"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="space-y-2 mb-8"
            >
              <label
                htmlFor="password-input"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: 'var(--color-primary)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Senha
              </label>
              <Input
                id="password-input"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full bg-[#f5f5f5] text-[#31251f] border-[#d8c5b6] focus:border-[#f18535] focus:ring-4 focus:ring-[rgba(241,133,53,0.15)] focus-visible:ring-offset-0 focus-visible:ring-[rgba(241,133,53,0.15)] placeholder:text-[#31251f]/50 h-12 rounded-lg font-['Avenir'] text-[14px] transition-all duration-300"
              />
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <Button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] rounded-lg font-bold text-[14px] uppercase tracking-[0.5px] transition-all duration-300"
                style={{
                  background: 'var(--color-primary)',
                  color: 'var(--color-text-dark)',
                  fontFamily: 'var(--font-heading)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'var(--color-primary-light)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(241, 133, 53, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'var(--color-primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isLoading ? (
                  <span className="w-5 h-5 rounded-full border-2 border-current border-t-transparent vx-spin" />
                ) : (
                  'Acessar Sistema'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 text-center leading-relaxed" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-accent)', opacity: 0.6 }}>
            <div><strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>demo:</strong> admin@voxion.ads</div>
            <div><strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>senha:</strong> adminpassword</div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="absolute bottom-6 w-full text-center"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-accent)', opacity: 0.5 }}
      >
        © 2025 Voxion Studio. Todos os direitos reservados.
      </motion.footer>
    </div>
  );
}
