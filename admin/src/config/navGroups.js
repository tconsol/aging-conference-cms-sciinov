import {
  LayoutDashboard, Globe, BookOpen, Calendar, CalendarClock, MapPin,
  Mic2, Users2, Building2, FileText, ClipboardList, DollarSign,
  Newspaper, BarChart2, Download, BookMarked, ScrollText, BookCopy,
  FileCheck, Handshake, MessageSquareQuote, Mail, MessageCircle,
  LifeBuoy, Settings, ShieldCheck, Building,
  UserPlus, Layers, Info, Ticket, LayoutTemplate, Palette,
} from 'lucide-react';

// Grouped to mirror the public client site's navbar (Overview / Speakers / Program /
// Information / Submit Abstract / Help & Support / Registration) so it's obvious which
// admin section manages which part of the public site.
// Shared between Sidebar.jsx (renders the groups) and Topbar.jsx (quick search over all links).
export const navGroups = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', single: true },
  {
    label: 'Overview',
    items: [
      { label: 'About', icon: Info, href: '/pages/about' },
      { label: 'Scientific Committee', icon: Users2, href: '/committee' },
      { label: 'Become a Speaker', icon: UserPlus, href: '/speaker-applications' },
      { label: 'Sponsor / Exhibit', icon: Handshake, href: '/sponsorship' },
      { label: 'Organizer Info', icon: Building2, href: '/organizers' },
    ],
  },
  {
    label: 'Speakers',
    items: [
      { label: 'Speakers', icon: Mic2, href: '/speakers' },
    ],
  },
  {
    label: 'Program',
    items: [
      { label: 'Scientific Sessions', icon: BookOpen, href: '/sessions' },
      { label: 'Scientific Program', icon: Calendar, href: '/program' },
      { label: 'Brochure Download', icon: BookMarked, href: '/brochure' },
      { label: 'Partners', icon: Building, href: '/partners' },
      { label: 'Submit Abstract', icon: FileText, href: '/abstracts' },
    ],
  },
  {
    label: 'Information',
    items: [
      { label: 'Important Dates', icon: CalendarClock, href: '/important-dates' },
      { label: 'Venue & Hospitality', icon: MapPin, href: '/venues' },
      { label: 'Guidelines', icon: ScrollText, href: '/pages/guidelines' },
      { label: 'Publication', icon: BookCopy, href: '/pages/publication' },
      { label: 'Pricing Tiers', icon: DollarSign, href: '/pricing' },
      { label: 'Registration', icon: ClipboardList, href: '/registrations' },
      { label: 'Quick Downloads', icon: Download, href: '/downloads' },
      { label: 'News / Blog', icon: Newspaper, href: '/news' },
      { label: 'Reports', icon: BarChart2, href: '/reports' },
      { label: 'Editions (Past Events)', icon: Globe, href: '/editions' },
    ],
  },
  {
    label: 'Help & Support',
    items: [
      { label: 'Help & Support', icon: LifeBuoy, href: '/help' },
      { label: 'FAQ Topics', icon: Layers, href: '/help/topics' },
      { label: 'Support Tickets', icon: Ticket, href: '/help/tickets' },
      { label: 'Contact Messages', icon: MessageCircle, href: '/contact' },
    ],
  },
  {
    label: 'Other',
    items: [
      { label: 'Testimonials', icon: MessageSquareQuote, href: '/testimonials' },
      { label: 'Newsletter', icon: Mail, href: '/newsletter' },
      { label: 'Terms & Conditions', icon: FileCheck, href: '/pages/terms' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Homepage CMS', icon: LayoutTemplate, href: '/homepage' },
      { label: 'Theme Colors', icon: Palette, href: '/theme' },
      { label: 'Site Settings', icon: Settings, href: '/settings' },
      { label: 'Admin Users', icon: ShieldCheck, href: '/admin-users' },
    ],
  },
];

// Flattened { label, href, icon, group } list for quick-search.
export const NAV_SEARCH_INDEX = navGroups.flatMap((group) =>
  group.single
    ? [{ label: group.label, href: group.href, icon: group.icon, group: group.label }]
    : group.items.map((item) => ({ ...item, group: group.label }))
);
