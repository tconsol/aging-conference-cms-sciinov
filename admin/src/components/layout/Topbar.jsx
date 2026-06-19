import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <header
      className="h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 z-10 bg-white border-b border-slate-200"
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 transition-colors"
        style={{ color: '#64748b' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#0f766e'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb label */}
      <div className="hidden lg:flex items-center gap-2">
        <span
          style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}
        >
          Aging Congress
        </span>
        <span style={{ color: '#cbd5e1', fontSize: 12 }}>·</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#0f766e',
          }}
        >
          Admin Panel
        </span>
      </div>

      {/* User dropdown */}
      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 transition-all"
          style={{
            border: dropdownOpen ? '1px solid #0f766e' : '1px solid #e2e8f0',
            background: dropdownOpen ? '#f0fdf9' : 'white',
            clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 28,
              height: 28,
              background: 'linear-gradient(135deg, #0f766e, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize leading-tight">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            style={{
              color: dropdownOpen ? '#0f766e' : '#94a3b8',
              transition: 'transform 0.15s ease',
              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <div
            className="absolute right-0 mt-1 w-52 bg-white z-50"
            style={{
              border: '1px solid #e2e8f0',
              borderTop: '2px solid #0f766e',
              boxShadow: '0 8px 24px rgba(15,118,110,0.1), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {/* User info */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Signed in as
              </p>
              <p className="text-sm font-medium text-slate-800 truncate mt-0.5">{user?.email}</p>
            </div>

            {/* Profile */}
            <button
              onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdf9'; e.currentTarget.style.color = '#0f766e'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
            >
              <User size={14} />
              Profile Settings
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
              style={{ color: '#dc2626', borderTop: '1px solid #f1f5f9' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
