'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────
export type Role = 'admin' | 'editor' | 'viewer';

export interface AuthUser {
  id:       string;
  username: string;
  role:     Role;
}

export interface AuthContextValue {
  /** Currently authenticated user, or null if not logged in. */
  user:    AuthUser | null;
  /** True while the initial session check is in flight. */
  loading: boolean;
  login:   (username: string, password: string) => Promise<{ error?: string }>;
  logout:  () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue>({
  user:    null,
  loading: true,
  login:   async () => ({}),
  logout:  async () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Attempt to silently refresh the access token using the refresh cookie,
   * then fetch /api/auth/me to hydrate user state.
   */
  const hydrateSession = useCallback(async () => {
    try {
      // 1. Try /me with the current access cookie
      let res = await fetch('/api/auth/me', { cache: 'no-store' });

      // 2. Access token expired → try a silent refresh
      if (res.status === 401) {
        const refresh = await fetch('/api/auth/refresh', {
          method: 'POST',
          cache:  'no-store',
        });

        if (!refresh.ok) {
          setUser(null);
          return;
        }

        // Retry /me with the new access token
        res = await fetch('/api/auth/me', { cache: 'no-store' });
      }

      if (res.ok) {
        const { user: u } = await res.json();
        setUser(u);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hydrate on mount
  useEffect(() => { hydrateSession(); }, [hydrateSession]);

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (
    username: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
        cache:   'no-store',
      });

      const json = await res.json();

      if (!res.ok) {
        return { error: json.error ?? 'Falha ao autenticar. Tente novamente.' };
      }

      setUser(json.user);
      return {};
    } catch {
      return { error: 'Erro de conexão. Verifique sua rede.' };
    }
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', cache: 'no-store' });
    } catch {
      // Even if the request fails, clear local state
    }
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
