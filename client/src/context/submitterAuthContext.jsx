import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import portalApi from '../api/portalApi';

const SubmitterAuthContext = createContext(null);

export function SubmitterAuthProvider({ children }) {
  const [submitter, setSubmitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const esRef = useRef(null);

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

  // SSE: connect when submitter is loaded, disconnect on logout
  useEffect(() => {
    if (!submitter?._id) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }
    if (esRef.current) return; // already connected for this session
    const token = localStorage.getItem('submitterToken');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_URL || '';
    const es = new EventSource(`${baseUrl}/abstracts/portal/events?token=${encodeURIComponent(token)}`);
    esRef.current = es;

    es.addEventListener('status_update', (e) => {
      const { status, adminNotes, acceptanceLetterUrl, acceptanceLetterName } = JSON.parse(e.data);
      setSubmitter((prev) => prev ? {
        ...prev,
        status,
        adminNotes: adminNotes ?? prev.adminNotes,
        acceptanceLetterUrl: acceptanceLetterUrl ?? prev.acceptanceLetterUrl,
        acceptanceLetterName: acceptanceLetterName ?? prev.acceptanceLetterName,
      } : prev);
    });

    es.onerror = () => { es.close(); esRef.current = null; };
  }, [submitter?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = fetchMe;

  return (
    <SubmitterAuthContext.Provider value={{ submitter, loading, login, logout, refresh }}>
      {children}
    </SubmitterAuthContext.Provider>
  );
}

export const useSubmitterAuth = () => useContext(SubmitterAuthContext);
