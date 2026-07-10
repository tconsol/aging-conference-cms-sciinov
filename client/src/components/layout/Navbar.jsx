import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { usecongress } from '../../context/congressContext';
import { congressAPI } from '../../api/congress';

const BASE_NAV_ITEMS = [
  {
    label: 'Overview',
    children: [
      { label: 'About', to: '/about' },
      { label: 'Scientific Committee', to: '/committee' },
      { label: 'Become a Speaker', to: '/become-a-speaker' },
      { label: 'Sponsor / Exhibit', to: '/sponsorship' },
      { label: 'Organizer Info', to: '/organizers' },
    ],
  },
  {
    label: 'Speakers',
    to: '/speakers',
  },
  {
    label: 'Program',
    children: [
      { label: 'Scientific Sessions', to: '/sessions' },
      { label: 'Scientific Program', to: '/program' },
      { label: 'Brochure Download', to: '/brochure' },
      { label: 'Partners', to: '/partners' },
    ],
  },
  {
    label: 'Information',
    children: [
      { label: 'Important Dates', to: '/important-dates' },
      { label: 'Venue', to: '/venue' },
      { label: 'Guidelines', to: '/guidelines' },
      { label: 'Publication', to: '/publication-policy' },
      { label: 'Pricing / Registration', to: '/pricing' },
      { label: 'Quick Downloads', to: '/downloads' },
      { label: 'News', to: '/news' },
      { label: 'Reports', to: '/reports' },
      { label: 'Past Events', to: '/editions?status=past' },
    ],
  },
  { label: 'Submit Abstract', to: '/abstract-submission' },
  { label: 'Help & Support', to: '/help' },
  { label: 'Registration', to: '/registration' },
];

function DropdownMenu({ items, isOpen }) {
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
      style={{
        transition: 'opacity 0.18s ease, transform 0.18s ease',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      <div
        className="w-56 shadow-xl"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderTop: '2px solid #0f766e',
          maxHeight: 340,
          overflowY: 'auto',
        }}
      >
        {items.map((item, i) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150"
            style={{ borderBottom: '1px solid #f1f5f9' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: '#14b8a6',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: '#334155' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0f766e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#334155'; }}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NavItem({ item, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const closeTimer = useRef(null);
  const location = useLocation();

  const isChildActive = item.children?.some((c) => location.pathname === c.to) ?? false;
  const highlighted = isActive || isChildActive;

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 100);
  };

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const linkStyle = {
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    padding: '6px 12px',
    position: 'relative',
    transition: 'color 0.15s ease',
    color: highlighted ? '#0f766e' : '#475569',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  };

  if (!item.children) {
    return (
      <Link
        to={item.to}
        style={linkStyle}
        onMouseEnter={(e) => { if (!highlighted) e.currentTarget.style.color = '#0d9488'; }}
        onMouseLeave={(e) => { if (!highlighted) e.currentTarget.style.color = '#475569'; }}
      >
        {item.label}
        {highlighted && (
          <span style={{
            position: 'absolute', bottom: 0, left: 12, right: 12,
            height: '1.5px', background: '#0f766e',
          }} />
        )}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={linkStyle}
        onMouseEnter={(e) => { if (!highlighted) e.currentTarget.style.color = '#0d9488'; }}
        onMouseLeave={(e) => { if (!highlighted) e.currentTarget.style.color = '#475569'; }}
      >
        {item.label}
        <ChevronDown
          size={9}
          strokeWidth={3}
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
        {highlighted && (
          <span style={{
            position: 'absolute', bottom: 0, left: 12, right: 12,
            height: '1.5px', background: '#0f766e',
          }} />
        )}
      </button>
      <DropdownMenu items={item.children} isOpen={open} />
    </div>
  );
}

function MobileNavItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHere = location.pathname === item.to;

  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '13px 24px',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    borderBottom: '1px solid #f1f5f9',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s',
  };

  if (!item.children) {
    return (
      <Link
        to={item.to}
        onClick={onClose}
        style={{ ...baseStyle, color: isHere ? '#0f766e' : '#64748b', textDecoration: 'none' }}
      >
        {item.label}
        {isHere && (
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#0f766e' }} />
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ ...baseStyle, color: open ? '#0f766e' : '#64748b', textAlign: 'left' }}
      >
        {item.label}
        <ChevronDown
          size={9}
          strokeWidth={3}
          style={{
            color: '#14b8a6',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      {open && (
        <div style={{ background: '#f8fafc' }}>
          {item.children.map((child, i) => (
            <Link
              key={child.to}
              to={child.to}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 24px 10px 32px',
                fontSize: '13px',
                fontWeight: 500,
                borderBottom: '1px solid #f1f5f9',
                color: location.pathname === child.to ? '#0f766e' : '#64748b',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: '9px', color: '#14b8a6', fontWeight: 700, letterSpacing: '0.05em' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [editions, setEditions] = useState([]);
  const { activeEdition, siteSettings } = usecongress();
  const location = useLocation();
  const navigate = useNavigate();
  const siteName = siteSettings?.siteName || 'Aging Congress';

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    congressAPI.getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setEditions(Array.isArray(data) ? data : []);
      })
      .catch(() => setEditions([]));
  }, []);

  const year = activeEdition?.year ?? new Date().getFullYear();

  const NAV_ITEMS = useMemo(() => {
    const speakersChildren = editions.map((e) => ({
      label: `Speakers ${e.year} ${e.city}`,
      to: `/speakers?edition=${e._id}`,
    }));
    return BASE_NAV_ITEMS.map((item) => {
      if (item.label !== 'Speakers') return item;
      return speakersChildren.length > 0
        ? { label: 'Speakers', children: speakersChildren }
        : { label: 'Speakers', to: '/speakers' };
    });
  }, [editions]);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 40,
          background: '#ffffff',
          boxShadow: scrolled
            ? '0 1px 0 #e2e8f0, 0 4px 24px rgba(15,118,110,0.08)'
            : '0 1px 0 #e2e8f0',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Teal accent stripe */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 40%, #2dd4bf 60%, #14b8a6 80%, #0f766e 100%)',
        }} />

        <div className="container-custom">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

            {/* Logo */}
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}
            >
              {siteSettings?.logo ? (
                <img
                  src={siteSettings.logo}
                  alt={siteName}
                  style={{ width: 38, height: 38, objectFit: 'contain', flexShrink: 0 }}
                />
              ) : (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                    clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))',
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    AC
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#0f172a',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {siteName}
                </span>
                <span
                  style={{
                    fontSize: 9.5,
                    color: '#14b8a6',
                    letterSpacing: '0.18em',
                    marginTop: 3,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}
                >
                  {year} Edition
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex" style={{ alignItems: 'center' }}>
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  isActive={!item.children && location.pathname === item.to}
                />
              ))}
            </nav>

            {/* Right: CTA + hamburger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => navigate('/registration')}
                className="hidden sm:inline-flex"
                style={{
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '10.5px',
                  fontWeight: 800,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  padding: '9px 20px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                  transition: 'opacity 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.88';
                  e.currentTarget.style.boxShadow = '0 0 18px rgba(15,118,110,0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Register →
              </button>

              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="lg:hidden"
                style={{
                  padding: 8,
                  color: '#64748b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#0f766e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className="lg:hidden"
          style={{
            overflow: 'hidden',
            maxHeight: mobileOpen ? 'calc(100vh - 62px)' : 0,
            opacity: mobileOpen ? 1 : 0,
            transition: 'max-height 0.28s ease, opacity 0.2s ease',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 62px)' }}>
            {NAV_ITEMS.map((item) => (
              <MobileNavItem key={item.label} item={item} onClose={() => setMobileOpen(false)} />
            ))}
            <div style={{ padding: 16, borderTop: '1px solid #f1f5f9' }}>
              <Link
                to="/registration"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                }}
              >
                Register Now →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer: 2px stripe + 60px bar */}
      <div style={{ height: 62 }} />
    </>
  );
}
