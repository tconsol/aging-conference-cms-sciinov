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
      { label: 'Submit Abstract', to: '/abstract-submission' },
      { label: 'Track My Abstract', to: '/portal/login' },
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
  {
    label: 'Help & Support',
    children: [
      { label: 'FAQs', to: '/help' },
      { label: 'Support Tickets', to: '/support-tickets' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    label: 'Others',
    children: [
      { label: 'Testimonials', to: '/testimonials' },
      { label: 'Newsletter', to: '/newsletter' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  },
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
          borderTop: '2px solid var(--brand-dark)',
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
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-light)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span
              style={{
                fontSize: '9px',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'var(--brand)',
                letterSpacing: '0.05em',
                flexShrink: 0,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <span
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: '#334155' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-dark)'; }}
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
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '6px 10px',
    position: 'relative',
    transition: 'color 0.15s ease',
    color: highlighted ? 'var(--brand-dark)' : '#475569',
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
        onMouseEnter={(e) => { if (!highlighted) e.currentTarget.style.color = 'var(--brand)'; }}
        onMouseLeave={(e) => { if (!highlighted) e.currentTarget.style.color = '#475569'; }}
      >
        {item.label}
        {highlighted && (
          <span style={{
            position: 'absolute', bottom: 0, left: 12, right: 12,
            height: '1.5px', background: 'var(--brand-dark)',
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
        onMouseEnter={(e) => { if (!highlighted) e.currentTarget.style.color = 'var(--brand)'; }}
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
            height: '1.5px', background: 'var(--brand-dark)',
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
        style={{ ...baseStyle, color: isHere ? 'var(--brand-dark)' : '#64748b', textDecoration: 'none' }}
      >
        {item.label}
        {isHere && (
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand-dark)' }} />
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ ...baseStyle, color: open ? 'var(--brand-dark)' : '#64748b', textAlign: 'left' }}
      >
        {item.label}
        <ChevronDown
          size={9}
          strokeWidth={3}
          style={{
            color: 'var(--brand)',
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
                color: location.pathname === child.to ? 'var(--brand-dark)' : '#64748b',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: '9px', color: 'var(--brand)', fontWeight: 700, letterSpacing: '0.05em' }}>
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
            ? '0 1px 0 #e2e8f0, 0 4px 24px color-mix(in srgb, var(--brand-dark) 8%, transparent)'
            : '0 1px 0 #e2e8f0',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {/* Teal accent stripe */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, var(--brand-dark) 0%, var(--brand) 40%, var(--brand) 60%, var(--brand) 80%, var(--brand-dark) 100%)',
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
                    background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%)',
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
                    color: 'var(--brand)',
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
              <style>{`
                @keyframes nav-shimmer {
                  0% { transform: translateX(-100%) skewX(-15deg); }
                  100% { transform: translateX(250%) skewX(-15deg); }
                }
                @keyframes nav-pulse-ring {
                  0% { transform: scale(1); opacity: 0.6; }
                  100% { transform: scale(1.55); opacity: 0; }
                }
                @keyframes nav-icon-bounce {
                  0%,100%{transform:translateY(0) scale(1)}
                  30%{transform:translateY(-3px) scale(1.15)}
                  60%{transform:translateY(1px) scale(0.95)}
                }
                .nav-reg-icon { animation: nav-icon-bounce 2.2s ease-in-out infinite; transform-origin: center; }
                .nav-register-btn {
                  position: relative;
                  overflow: hidden;
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 10.5px;
                  font-weight: 800;
                  letter-spacing: 0.08em;
                  text-transform: uppercase;
                  padding: 8px 18px;
                  background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 60%, color-mix(in srgb, var(--brand) 70%, white) 100%);
                  color: #ffffff;
                  border: none;
                  cursor: pointer;
                  border-radius: 6px;
                  transition: transform 0.18s ease, box-shadow 0.18s ease;
                  box-shadow: 0 2px 12px color-mix(in srgb, var(--brand) 30%, transparent);
                }
                .nav-register-btn::before {
                  content: '';
                  position: absolute;
                  top: 0; left: 0;
                  width: 40%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
                  animation: nav-shimmer 2.4s ease-in-out infinite;
                }
                .nav-register-btn::after {
                  content: '';
                  position: absolute;
                  inset: 0;
                  border-radius: 6px;
                  border: 1px solid rgba(255,255,255,0.25);
                  pointer-events: none;
                }
                .nav-register-btn:hover {
                  transform: translateY(-1px) scale(1.03);
                  box-shadow: 0 6px 24px color-mix(in srgb, var(--brand) 45%, transparent);
                }
                .nav-register-btn:active {
                  transform: translateY(0) scale(0.98);
                }
                .nav-register-btn .arrow {
                  display: inline-block;
                  transition: transform 0.2s ease;
                }
                .nav-register-btn:hover .arrow {
                  transform: translateX(3px);
                }
                .nav-register-pulse {
                  position: absolute;
                  inset: 0;
                  border-radius: 6px;
                  background: var(--brand);
                  animation: nav-pulse-ring 2s ease-out infinite;
                  z-index: -1;
                  pointer-events: none;
                }
              `}</style>

              {/* Divider */}
              <div className="hidden lg:block" style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

              {/* Track — icon+label on xl, icon-only on lg */}
              <Link
                to="/portal/login"
                title="Track My Abstract Submission"
                className="hidden lg:inline-flex items-center gap-1.5"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1.5px solid #cbd5e1',
                  color: '#475569',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand-dark)'; e.currentTarget.style.background = 'var(--brand-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="hidden xl:inline">Track</span>
              </Link>

              <div style={{ position: 'relative', zIndex: 0 }} className="hidden sm:block">
                <div className="nav-register-pulse" />
                <button
                  onClick={() => navigate('/registration')}
                  className="nav-register-btn"
                >
                  <svg className="nav-reg-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
                  </svg>
                  Register <span className="arrow">→</span>
                </button>
              </div>

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
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-dark)'; }}
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
            <div style={{ padding: 16, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/portal/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '12px', borderRadius: 6, textDecoration: 'none',
                  border: '1.5px solid var(--brand)', color: 'var(--brand-dark)',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Track My Abstract
              </Link>
              <Link
                to="/registration"
                onClick={() => setMobileOpen(false)}
                className="nav-register-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  textDecoration: 'none',
                  width: '100%',
                  padding: '14px',
                }}
              >
                Register Now <span className="arrow" style={{ marginLeft: 4 }}>→</span>
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
