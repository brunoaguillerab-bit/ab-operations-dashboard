'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, login } = useAuth();

  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted,    setMounted]    = useState(false);

  useEffect(() => { setMounted(true); }, []);

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
  }

  if (authLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (user) return null;

  const canSubmit = username.trim().length > 0 && password.length > 0 && !submitting;

  return (
    <div style={styles.page}>
      {/* ── Animated background orbs ── */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      {/* ── Noise texture overlay ── */}
      <div style={styles.noiseOverlay} />

      {/* ── Grid lines ── */}
      <div style={styles.gridOverlay} />

      {/* ── Content ── */}
      <div style={{ ...styles.wrapper, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>

        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src="/logo.png" alt="AB Tracking" style={styles.logoImg} />
          <div style={styles.logoSeparator} />
          <p style={styles.logoSubtitle}>Painel Operacional</p>
        </div>

        {/* Card */}
        <div style={styles.card}>
          {/* Card top glow line */}
          <div style={styles.cardTopLine} />

          <div style={styles.cardInner}>
            <div style={styles.cardHeader}>
              <h1 style={styles.cardTitle}>Bem‑vindo de volta</h1>
              <p style={styles.cardDesc}>Entre com suas credenciais para continuar</p>
            </div>

            {/* Error banner */}
            {error && (
              <div style={styles.errorBanner}>
                <AlertCircle size={15} style={{ color: '#F87171', flexShrink: 0, marginTop: 1 }} />
                <p style={styles.errorText}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* Email / Username field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Usuário</label>
                <div style={styles.inputWrap}>
                  <input
                    id="login-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(null); }}
                    placeholder="seu.usuario"
                    required
                    style={styles.input}
                    onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Senha</label>
                <div style={{ ...styles.inputWrap, position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    required
                    style={{ ...styles.input, paddingRight: 48 }}
                    onFocus={e => Object.assign(e.target.style, styles.inputFocus)}
                    onBlur={e => Object.assign(e.target.style, styles.inputBlur)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={styles.eyeBtn}
                    onMouseEnter={e => (e.currentTarget.style.color = '#A1A1AA')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={!canSubmit}
                style={{
                  ...styles.submitBtn,
                  opacity: canSubmit ? 1 : 0.45,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={e => { if (canSubmit) Object.assign(e.currentTarget.style, styles.submitBtnHover); }}
                onMouseLeave={e => { if (canSubmit) Object.assign(e.currentTarget.style, { transform: 'translateY(0)', boxShadow: styles.submitBtn.boxShadow }); }}
              >
                {submitting ? (
                  <>
                    <div style={styles.btnSpinner} />
                    <span>Entrando…</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p style={styles.footer}>
          <span style={styles.footerDot} />
          Acesso restrito · AB Tracking Operacional
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 30px) scale(1.08); }
          66% { transform: translate(30px, -20px) scale(0.95); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 40px) scale(1.1); }
        }
        @keyframes spinBtn {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        #login-username, #login-password {
          font-family: 'Inter', sans-serif !important;
        }
        #login-username::placeholder, #login-password::placeholder {
          color: #3A3F4A;
        }
        #login-submit {
          background: linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%);
          background-size: 200% auto;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-position 0.4s ease;
        }
        #login-submit:hover:not(:disabled) {
          background-position: right center;
        }
      `}</style>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 60% 0%, #1A0A0A 0%, #0A0A0F 40%, #060608 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute',
    top: '-20%',
    right: '-10%',
    width: 700,
    height: 700,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)',
    animation: 'orbFloat1 18s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute',
    bottom: '-25%',
    left: '-15%',
    width: 800,
    height: 800,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%)',
    animation: 'orbFloat2 22s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute',
    top: '40%',
    left: '20%',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
    animation: 'orbFloat3 28s ease-in-out infinite',
    pointerEvents: 'none',
  },
  noiseOverlay: {
    position: 'absolute',
    inset: 0,
    opacity: 0.025,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '128px',
    pointerEvents: 'none',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: '64px 64px',
    pointerEvents: 'none',
  },
  wrapper: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: 400,
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 32,
  },
  logoWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    height: 160,
    width: 'auto',
    filter: 'drop-shadow(0 0 32px rgba(239,68,68,0.3)) drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
  },
  logoSeparator: {
    width: 40,
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)',
  },
  logoSubtitle: {
    fontSize: 11,
    fontWeight: 500,
    color: '#4B5563',
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
  },
  card: {
    width: '100%',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 24,
    boxShadow: `
      0 0 0 1px rgba(255,255,255,0.04),
      0 32px 64px -16px rgba(0,0,0,0.7),
      0 8px 32px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.06)
    `,
    position: 'relative',
    overflow: 'hidden',
  },
  cardTopLine: {
    position: 'absolute',
    top: 0,
    left: '15%',
    right: '15%',
    height: 1,
    background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.6), transparent)',
  },
  cardInner: {
    padding: '40px 36px',
  },
  cardHeader: {
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-0.03em',
    marginBottom: 6,
    margin: 0,
  },
  cardDesc: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: 400,
    marginTop: 6,
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 13,
    color: '#F87171',
    lineHeight: 1.5,
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6B7280',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(0,0,0,0.35)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: 400,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
    boxSizing: 'border-box',
  },
  inputFocus: {
    borderColor: 'rgba(239,68,68,0.5)',
    boxShadow: '0 0 0 3px rgba(239,68,68,0.08), 0 0 20px rgba(239,68,68,0.05)',
    background: 'rgba(0,0,0,0.5)',
  },
  inputBlur: {
    borderColor: 'rgba(255,255,255,0.07)',
    boxShadow: 'none',
    background: 'rgba(0,0,0,0.35)',
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#4B5563',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 4,
    transition: 'color 0.2s ease',
  },
  submitBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '15px 24px',
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
    border: 'none',
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: '0.01em',
    boxShadow: '0 4px 24px rgba(239,68,68,0.3), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    marginTop: 4,
  },
  submitBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(239,68,68,0.45), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
  },
  btnSpinner: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spinBtn 0.7s linear infinite',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#2D3748',
    fontWeight: 500,
    letterSpacing: '0.04em',
  },
  footerDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#EF4444',
    boxShadow: '0 0 8px rgba(239,68,68,0.6)',
  },
  spinner: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '2px solid rgba(239,68,68,0.2)',
    borderTopColor: '#EF4444',
    animation: 'spinBtn 0.8s linear infinite',
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
