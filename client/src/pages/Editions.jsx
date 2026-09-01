import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight, BookOpen, FileText, Images, ArrowUpRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { formatDate } from '../utils/helpers';

const STATUS_CONFIG = {
  active:   { label: 'Active',       style: { background: 'var(--brand-light)', color: 'var(--brand-dark)', borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)' } },
  upcoming: { label: 'Upcoming',     style: { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } },
  past:     { label: 'Past Edition', style: { background: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' } },
};

// Small "what's inside" chip shown when an edition has extra content
function Chip({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
      <Icon size={11} style={{ color: 'var(--brand-dark)' }} />
      {label}
    </span>
  );
}

function EditionCard({ ed }) {
  const sc = STATUS_CONFIG[ed.status] || STATUS_CONFIG.upcoming;
  const hasBook    = !!ed.conferenceBook?.fileUrl;
  const hasProgram = !!ed.conferenceProgram?.fileUrl;

  return (
    <Link
      to={`/editions/${ed._id}`}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-slate-200 transition-all duration-300 flex flex-col"
    >
      {/* Banner fixed ratio box, image always fills it */}
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        {ed.bannerImage ? (
          <img
            src={ed.bannerImage}
            alt={ed.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 55%, black) 100%)' }}
          >
            <span className="text-5xl font-black text-white/15 select-none">{ed.year}</span>
          </div>
        )}

        {/* Legibility scrim + overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span
          className="absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full border backdrop-blur-sm"
          style={sc.style}
        >
          {sc.label}
        </span>
        <span className="absolute bottom-3 left-4 text-xs font-black uppercase tracking-[0.2em] text-white/90">
          {ed.year}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-[color:var(--brand-dark)] transition-colors">
          {ed.title}
        </h3>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={13} style={{ color: 'var(--brand-dark)' }} className="shrink-0" />
            <span>{formatDate(ed.startDate)} – {formatDate(ed.endDate)}</span>
          </div>
          {(ed.city || ed.country) && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={13} style={{ color: 'var(--brand-dark)' }} className="shrink-0" />
              <span>{[ed.city, ed.country].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Teaser only the full text lives on the detail page */}
        {ed.description && (
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{ed.description}</p>
        )}

        {(hasBook || hasProgram) && (
          <div className="flex flex-wrap gap-1.5">
            {hasBook && <Chip icon={BookOpen} label="Book" />}
            {hasProgram && <Chip icon={FileText} label="Program" />}
            <Chip icon={Images} label="Gallery" />
          </div>
        )}

        <span
          className="mt-auto pt-3 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
          style={{ color: 'var(--brand-dark)' }}
        >
          View Details
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export default function Editions() {
  const [searchParams] = useSearchParams();
  const pastOnly = searchParams.get('status') === 'past';
  const [editions, setEditions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    congressAPI.getAll()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setEditions(Array.isArray(data) ? data : []);
      })
      .catch(() => setEditions([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleEditions = pastOnly ? editions.filter((e) => e.status === 'past') : editions;

  return (
    <div>
      <PageHero
        title={pastOnly ? 'Past Events' : 'Congress Editions'}
        subtitle={pastOnly
          ? 'Revisit previous editions proceedings, programs, and event photo galleries.'
          : 'Explore past, present, and upcoming editions of the Aging Congress.'}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Congress' }, { label: pastOnly ? 'Past Events' : 'Editions' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : visibleEditions.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader
                title={pastOnly ? 'No past events yet' : 'No editions yet'}
                subtitle={pastOnly ? 'Past editions will appear here once completed.' : 'Check back soon for congress edition announcements.'}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleEditions.map((ed) => (
                <EditionCard key={ed._id} ed={ed} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
