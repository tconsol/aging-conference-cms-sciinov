import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RegistrationBadgeContext = createContext(null);

// Nav path -> which counter it clears when visited
const PATHS = {
  registrations: '/registrations',
  abstracts: '/abstracts',
};

export function RegistrationBadgeProvider({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  const [count, setCount] = useState(0);                 // registrations
  const [abstractCount, setAbstractCount] = useState(0); // abstracts
  const [lastEventTime, setLastEventTime] = useState(null);
  const [lastAbstractEventTime, setLastAbstractEventTime] = useState(null);

  const esRef = useRef(null);
  const pathnameRef = useRef(location.pathname);

  // Keep pathnameRef current so SSE handlers read latest value without stale closure
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Reset the relevant badge when its page is opened
  useEffect(() => {
    if (location.pathname === PATHS.registrations) setCount(0);
    if (location.pathname === PATHS.abstracts) setAbstractCount(0);
  }, [location.pathname]);

  // SSE connection for live events
  useEffect(() => {
    if (!token) return;

    let es;
    let retryTimeout;

    const connect = () => {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      es = new EventSource(`${baseUrl}/registrations/events?token=${encodeURIComponent(token)}`);
      esRef.current = es;

      const handleRegistration = () => {
        setLastEventTime(Date.now());
        if (pathnameRef.current !== PATHS.registrations) setCount((c) => c + 1);
      };

      const handleAbstract = () => {
        setLastAbstractEventTime(Date.now());
        if (pathnameRef.current !== PATHS.abstracts) setAbstractCount((c) => c + 1);
      };

      es.addEventListener('new_registration', handleRegistration);
      es.addEventListener('new_intent', handleRegistration);
      es.addEventListener('new_abstract', handleAbstract);

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetCount = useCallback(() => setCount(0), []);
  const resetAbstractCount = useCallback(() => setAbstractCount(0), []);

  // Badge counts keyed by nav href, consumed by the Sidebar
  const badges = {
    [PATHS.registrations]: count,
    [PATHS.abstracts]: abstractCount,
  };

  return (
    <RegistrationBadgeContext.Provider
      value={{
        count,
        resetCount,
        lastEventTime,
        abstractCount,
        resetAbstractCount,
        lastAbstractEventTime,
        badges,
      }}
    >
      {children}
    </RegistrationBadgeContext.Provider>
  );
}

export function useRegistrationBadge() {
  const ctx = useContext(RegistrationBadgeContext);
  if (!ctx) throw new Error('useRegistrationBadge must be inside RegistrationBadgeProvider');
  return ctx;
}
