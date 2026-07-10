import { Link } from 'react-router-dom';
import { Activity, Linkedin, Twitter, Facebook, Youtube, Instagram } from 'lucide-react';
import { usecongress } from '../../context/congressContext';
import NewsletterWidget from '../ui/NewsletterWidget';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Sessions', to: '/sessions' },
  { label: 'Scientific Program', to: '/program' },
  { label: 'Speakers', to: '/speakers' },
  { label: 'Committee', to: '/committee' },
];

const SUBMISSION_LINKS = [
  { label: 'Submit Abstract', to: '/abstract-submission' },
  { label: 'Register', to: '/registration' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Important Dates', to: '/important-dates' },
];

const SUPPORT_LINKS = [
  { label: 'Contact', to: '/contact' },
  { label: 'Help & FAQs', to: '/help' },
  { label: 'Sponsorship', to: '/sponsorship' },
  { label: 'Partners', to: '/partners' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Newsletter', to: '/newsletter' },
  { label: 'Terms', to: '/terms' },
];

const SOCIAL_ICON_MAP = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  instagram: Instagram,
};

const DEFAULT_SOCIALS = [
  { platform: 'linkedin', url: '#' },
  { platform: 'twitter', url: '#' },
  { platform: 'facebook', url: '#' },
];

export default function Footer() {
  const { siteSettings } = usecongress();
  const siteName = siteSettings?.siteName || 'Aging Congress';

  const activeSocials = Object.entries(siteSettings?.socialLinks || {})
    .filter(([, url]) => Boolean(url))
    .map(([platform, url]) => ({ platform, url }));
  const socials = activeSocials.length > 0 ? activeSocials : DEFAULT_SOCIALS;

  return (
    <footer className="bg-slate-950 text-slate-400">
      {/* Main footer grid */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand + social + newsletter */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              {siteSettings?.logo ? (
                <img src={siteSettings.logo} alt={siteName} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 bg-teal-700 flex items-center justify-center">
                  <Activity size={16} className="text-white" />
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="text-sm font-black text-white tracking-tight">
                  {siteName}
                </span>
                <span className="text-xs text-teal-400 font-semibold">International Series</span>
              </div>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {siteSettings?.tagline ||
                'Advancing the frontiers of geroscience, longevity research, and healthy aging through global collaboration.'}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2 mb-8">
              {socials.map((s) => {
                const Icon = SOCIAL_ICON_MAP[s.platform?.toLowerCase()] ?? Activity;
                return (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.platform}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-teal-700 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>

            {/* Newsletter */}
            <div>
              <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-3">
                Newsletter
              </p>
              <NewsletterWidget light />
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Submissions */}
          <div>
            <h3 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
              Submissions
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SUBMISSION_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Support */}
          <div>
            <h3 className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
              Support
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: 'Guidelines', to: '/guidelines' },
              { label: 'Publication Policy', to: '/publication-policy' },
              { label: 'Terms', to: '/terms' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs text-slate-600 hover:text-teal-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
