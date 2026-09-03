import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

// localStorage stores strings, so setItem(key, undefined) writes the literal
// "undefined" — which is truthy and blows up JSON.parse. An earlier build with
// a broken API base URL wrote exactly that, and the crash happened during the
// useState initialiser, before React could mount anything to show it. Treat a
// stored "undefined"/"null" as absent and clear it.
const readStored = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw || raw === 'undefined' || raw === 'null') {
    if (raw) localStorage.removeItem(key);
    return null;
  }
  return raw;
};

const readStoredJSON = (key) => {
  const raw = readStored(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredJSON('admin_user'));
  const [token, setToken] = useState(() => readStored('admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI
        .getMe()
        .then((res) => {
          const admin = res.data?.admin;
          // A 200 carrying no admin means the response did not come from our
          // API (a misrouted request gets the SPA's index.html back). Treat it
          // as a failed session rather than writing junk to localStorage.
          if (!admin) return logout();
          setUser(admin);
          localStorage.setItem('admin_user', JSON.stringify(admin));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((tokenValue, userData) => {
    // Never persist an undefined pair: that is what poisoned localStorage and
    // made the app crash on its next load rather than just failing the login.
    if (!tokenValue || !userData) {
      throw new Error('login() called without a token and admin payload.');
    }
    localStorage.setItem('admin_token', tokenValue);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
