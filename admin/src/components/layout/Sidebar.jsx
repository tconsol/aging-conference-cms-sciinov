import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Globe, BookOpen, Calendar, CalendarClock, MapPin,
  Mic2, Users2, Building2, FileText, ClipboardList, DollarSign,
  Newspaper, BarChart2, Download, BookMarked, ScrollText, BookCopy,
  FileCheck, Handshake, MessageSquareQuote, Mail, MessageCircle,
  LifeBuoy, Settings, ShieldCheck, ChevronDown, X, Building, Activity,
} from 'lucide-react';

const navGroups = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', single: true },
  {
    label: 'Congress',
    items: [
      { label: 'Editions', icon: Globe, href: '/editions' },
      { label: 'Scientific Sessions', icon: BookOpen, href: '/sessions' },
      { label: 'Scientific Program', icon: Calendar, href: '/program' },
      { label: 'Important Dates', icon: CalendarClock, href: '/important-dates' },
      { label: 'Venue & Hospitality', icon: MapPin, href: '/venues' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Speakers', icon: Mic2, href: '/speakers' },
      { label: 'Committee', icon: Users2, href: '/committee' },
      { label: 'Organizers', icon: Building2, href: '/organizers' },
    ],
  },
  {
    label: 'Submissions',
    items: [
      { label: 'Abstracts', icon: FileText, href: '/abstracts' },
      { label: 'Registrations', icon: ClipboardList, href: '/registrations' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Pricing Tiers', icon: DollarSign, href: '/pricing' },
      { label: 'Sponsorship', icon: Handshake, href: '/sponsorship' },
    ],
  },
  {
    label: 'CMS Content',
    items: [
      { label: 'News / Blog', icon: Newspaper, href: '/news' },
      { label: 'Reports', icon: BarChart2, href: '/reports' },
      { label: 'Downloads', icon: Download, href: '/downloads' },
      { label: 'Brochure', icon: BookMarked, href: '/brochure' },
      { label: 'Guidelines', icon: ScrollText, href: '/pages/guidelines' },
      { label: 'Publication', icon: BookCopy, href: '/pages/publication' },
      { label: 'Terms & Conditions', icon: FileCheck, href: '/pages/terms' },
    ],
  },
  {
    label: 'Community',
    items: [
      { label: 'Partners', icon: Building, href: '/partners' },
      { label: 'Testimonials', icon: MessageSquareQuote, href: '/testimonials' },
      { label: 'Newsletter', icon: Mail, href: '/newsletter' },
    ],
  },
  {
    label: 'Inbox',
    items: [
      { label: 'Contact Messages', icon: MessageCircle, href: '/contact' },
      { label: 'Help & Support', icon: LifeBuoy, href: '/help' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Site Settings', icon: Settings, href: '/settings' },
      { label: 'Admin Users', icon: ShieldCheck, href: '/admin-users' },
    ],
  },
];

function NavGroup({ group }) {
  const location = useLocation();
  const isActive = group.items?.some((item) => location.pathname.startsWith(item.href));
  const [open, setOpen] = useState(isActive);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-colors hover:bg-slate-100"
      >
        <span className={`text-xs font-semibold uppercase tracking-wider ${isActive ? 'text-teal-700' : 'text-slate-400'}`}>
          {group.label}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isActive ? 'text-teal-600' : 'text-slate-400'}`}
        />
      </button>

      {open && (
        <div className="mt-0.5 mb-2 space-y-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive: active }) =>
                `flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-all duration-150 ${
                  active
                    ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
                }`
              }
            >
              <item.icon size={14} className="flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-200 flex-shrink-0">
          <span className="text-sm font-bold text-slate-800">Aging Congress</span>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}

function SidebarContent() {
  return (
    <>
      {/* Logo */}
      <div className="hidden lg:flex items-center gap-3 px-4 h-16 border-b border-slate-200 flex-shrink-0">
        <div className="w-8 h-8 bg-teal-700 flex items-center justify-center rounded-md flex-shrink-0">
          <Activity size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-tight truncate">Aging Congress</p>
          <p className="text-xs text-teal-600 font-medium">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navGroups.map((group) =>
          group.single ? (
            <NavLink
              key={group.href}
              to={group.href}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold border-l-2 border-teal-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent'
                }`
              }
            >
              <group.icon size={16} className="flex-shrink-0" />
              {group.label}
            </NavLink>
          ) : (
            <NavGroup key={group.label} group={group} />
          )
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 flex-shrink-0">
        <p className="text-xs text-slate-400 text-center">v1.0.0 · Aging Congress CMS</p>
      </div>
    </>
  );
}
