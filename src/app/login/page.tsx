'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login } = useAuth();

  const [username,    setUsername]    = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      const from = searchParams.get('from') ?? '/clientes';
      router.replace(from);
    }
  }, [user, authLoading, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    const result = await login(username.trim(), password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    }
    // On success, the AuthContext sets user → useEffect above redirects
  }

  // Show nothing while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EF4444] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already logged in — flash-free redirect handled by useEffect
  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center px-4">
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#EF4444]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#EF4444]/5 rounded-full blur-3xl" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-lg shadow-red-900/40 mb-4">
            <span className="text-white font-bold text-xl">AB</span>
          </div>
          <h1 className="text-2xl font-bold text-white">AB Track</h1>
          <p className="text-[#6B7280] text-sm mt-1">Painel operacional da agência</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#181C25] border border-[#2A2F3A] rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Entrar na conta</h2>

          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 mb-5 p-3.5 bg-red-900/20 border border-red-600/40 rounded-lg">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-2">
              Usuário
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(null); }}
              placeholder="seu.usuario"
              required
              className="w-full px-4 py-3 bg-[#0F1117] border border-[#2A2F3A] rounded-lg text-white placeholder-[#4B5563] text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]/20 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null); }}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-11 bg-[#0F1117] border border-[#2A2F3A] rounded-lg text-white placeholder-[#4B5563] text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B5563] hover:text-[#A1A1AA] transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#EF4444] hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF4444]/40"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Entrando…
              </>
            ) : (
              <>
                <LogIn size={16} />
                Entrar
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[#4B5563] text-xs mt-6">
          Acesso restrito · AB Track Operacional
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
