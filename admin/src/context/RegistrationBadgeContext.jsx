import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RegistrationBadgeContext = createContext(null);

// SSE event -> the sidebar nav href whose badge it increments.
// Visiting that href clears the badge. Add a row here to badge a new section.
const EVENT_PATHS = {
  new_registration: '/registrations',
  new_intent:       '/registrations',
  new_abstract:     '/abstracts',
  new_ticket:       '/help/tickets',
  new_contact:      '/contact',
  new_subscriber:   '/newsletter',
};

const BADGE_PATHS = [...new Set(Object.values(EVENT_PATHS))];

export function RegistrationBadgeProvider({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  // { '/registrations': 2, '/contact': 1, ... }
  const [counts, setCounts] = useState({});
  // { '/registrations': 1712345678901, ... } pages watch these to auto-refresh
  const [lastEvents, setLastEvents] = useState({});

  const esRef = useRef(null);
  const pathnameRef = useRef(location.pathname);

  // Keep pathnameRef current so SSE handlers read the latest value without a stale closure
  useEffect(() => {
    pathnameRef.current = location.pathname;
  }, [location.pathname]);

  // Clear a section's badge as soon as its page is opened
  useEffect(() => {
    if (BADGE_PATHS.includes(location.pathname)) {
      setCounts((c) => (c[location.pathname] ? { ...c, [location.pathname]: 0 } : c));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!token) return;

    let es;
    let retryTimeout;

    const connect = () => {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      es = new EventSource(`${baseUrl}/registrations/events?token=${encodeURIComponent(token)}`);
      esRef.current = es;

      Object.entries(EVENT_PATHS).forEach(([event, path]) => {
        es.addEventListener(event, () => {
          setLastEvents((prev) => ({ ...prev, [path]: Date.now() }));
          // Don't badge the page the admin is already looking at
          if (pathnameRef.current !== path) {
            setCounts((prev) => ({ ...prev, [path]: (prev[path] || 0) + 1 }));
          }
        });
      });

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

  const resetPath = useCallback((path) => {
    setCounts((prev) => (prev[path] ? { ...prev, [path]: 0 } : prev));
  }, []);

  const value = {
    badges: counts,
    lastEvents,
    resetPath,

    // Convenience accessors for the pages already wired up
    count: counts['/registrations'] || 0,
    lastEventTime: lastEvents['/registrations'] || null,
    resetCount: useCallback(() => resetPath('/registrations'), [resetPath]),

    abstractCount: counts['/abstracts'] || 0,
    lastAbstractEventTime: lastEvents['/abstracts'] || null,
    resetAbstractCount: useCallback(() => resetPath('/abstracts'), [resetPath]),
  };

  return (
    <RegistrationBadgeContext.Provider value={value}>
      {children}
    </RegistrationBadgeContext.Provider>
  );
}

export function useRegistrationBadge() {
  const ctx = useContext(RegistrationBadgeContext);
  if (!ctx) throw new Error('useRegistrationBadge must be inside RegistrationBadgeProvider');
  return ctx;
}
