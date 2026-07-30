import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import portalApi from '../api/portalApi';

const SubmitterAuthContext = createContext(null);

export function SubmitterAuthProvider({ children }) {
  const [submitter, setSubmitter] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await portalApi.get('/abstracts/portal/me');
      setSubmitter(res.data.data);
    } catch {
      localStorage.removeItem('submitterToken');
      setSubmitter(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('submitterToken');
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = async (loginId, password) => {
    const res = await portalApi.post('/abstracts/portal/login', { loginId, password });
    localStorage.setItem('submitterToken', res.data.token);
    setSubmitter(res.data.data);
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem('submitterToken');
    setSubmitter(null);
  };

  const refresh = fetchMe;

  return (
    <SubmitterAuthContext.Provider value={{ submitter, loading, login, logout, refresh }}>
      {children}
    </SubmitterAuthContext.Provider>
  );
}

export const useSubmitterAuth = () => useContext(SubmitterAuthContext);
