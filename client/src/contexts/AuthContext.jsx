import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_STORAGE_KEY = 'evantor-auth-user';

const DEMO_USERS = [
  { id: 1, name: 'Hanfal', email: 'sk@gmail.com', password: 'sk123123', role: 'organizer' },
  { id: 2, name: 'Demo User', email: 'user@evantor.lk', password: 'demo1234', role: 'attendee' },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const found = DEMO_USERS.find((u) => u.id === parsed.id && u.email === parsed.email);
        if (found) setUser({ id: found.id, name: found.name, email: found.email, role: found.role });
      }
    } catch (_) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistUser = useCallback((u) => {
    if (u) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ id: u.id, email: u.email, name: u.name, role: u.role }));
      } catch (_) {}
    } else {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch (_) {}
    }
  }, []);

  const login = useCallback(
    async (email, password) => {
      const normalized = (email || '').trim().toLowerCase();
      const u = DEMO_USERS.find((x) => x.email.toLowerCase() === normalized && x.password === password);
      if (u) {
        const userInfo = { id: u.id, name: u.name, email: u.email, role: u.role };
        setUser(userInfo);
        persistUser(userInfo);
        return { success: true };
      }
      return { success: false, error: 'Invalid email or password.' };
    },
    [persistUser]
  );

  const register = useCallback(
    async (name, email, password) => {
      const normalized = (email || '').trim().toLowerCase();
      if (DEMO_USERS.some((u) => u.email.toLowerCase() === normalized)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      const newUser = {
        id: Date.now(),
        name: (name || '').trim(),
        email: normalized,
        password,
        role: 'attendee',
      };
      DEMO_USERS.push(newUser);
      const userInfo = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
      setUser(userInfo);
      persistUser(userInfo);
      return { success: true };
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    persistUser(null);
  }, [persistUser]);

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
