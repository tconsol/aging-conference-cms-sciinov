import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Mic,
  ChevronRight,
  Globe,
  Award,
  BookOpen,
  FlaskConical,
  Heart,
  Lightbulb,
  Star,
  Stethoscope,
  Cpu,
  Quote,
} from 'lucide-react';

function TestimonialCard({ t }) {
  return (
    <div className="w-80 shrink-0 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-teal-500/30 transition-colors cursor-default">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      {/* Quote icon */}
      <Quote size={22} className="text-teal-500/60 mb-3" />
      {/* Message */}
      <p className="text-slate-300 text-sm leading-relaxed line-clamp-4 mb-5">
        {t.message}
      </p>
      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
        {t.photo ? (
          <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500/30" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center ring-2 ring-teal-500/30">
            <span className="text-white font-bold text-sm">{t.name?.[0] ?? 'A'}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{t.name}</p>
          {(t.designation || t.country) && (
            <p className="text-xs text-slate-500 truncate">
              {[t.designation, t.country].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
import { usecongress } from '../context/congressContext';
import { congressAPI } from '../api/congress';
import { peopleAPI } from '../api/people';
import { contentAPI } from '../api/content';
import { communityAPI } from '../api/community';
import CountdownTimer from '../components/ui/CountdownTimer';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import JourneySection from '../components/sections/JourneySection';
import { formatDateShort, truncate } from '../utils/helpers';

const ICON_MAP = {
  BookOpen, Mic, Users, Award, Globe, Calendar, MapPin,
  FlaskConical, Heart, Lightbulb, Star, Stethoscope, Cpu,
};

const DEFAULT_STATS = [
  { label: 'Attendees', value: '1,200+' },
  { label: 'Speakers', value: '60+' },
  { label: 'Countries', value: '45+' },
  { label: 'Sessions', value: '30+' },
];

const DEFAULT_FEATURES = [
  { icon: 'BookOpen', title: 'Research Sessions', desc: 'Cutting-edge presentations across all areas of geroscience' },
  { icon: 'Mic', title: 'Keynote Speakers', desc: 'Nobel laureates and leading researchers from top institutions' },
  { icon: 'Users', title: 'Global Networking', desc: 'Connect with peers from 45+ countries worldwide' },
  { icon: 'Award', title: 'Research Awards', desc: 'Recognizing excellence in aging research and innovation' },
];

export default function Home() {
  const { activeEdition, siteSettings, loading: congressLoading } = usecongress();
  const [speakers, setSpeakers] = useState([]);
  const [news, setNews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [dates, setDates] = useState([]);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (congressLoading) return;
    const editionId = activeEdition?._id;
    Promise.all([
      peopleAPI.getSpeakers({ featured: true, limit: 6 }).catch(() => ({ data: { data: [] } })),
      contentAPI.getLatestNews().catch(() => ({ data: { data: [] } })),
      communityAPI.getTestimonials().catch(() => ({ data: { data: [] } })),
      congressAPI
        .getImportantDates(editionId ? { edition: editionId } : {})
        .catch(() => ({ data: { data: [] } })),
      editionId
        ? congressAPI.getVenueByEdition(editionId).catch(() => ({ data: { data: null } }))
        : Promise.resolve({ data: { data: null } }),
    ]).then(([spRes, newsRes, testRes, datesRes, venueRes]) => {
      setSpeakers(
        Array.isArray(spRes.data?.data) ? spRes.data.data : Array.isArray(spRes.data) ? spRes.data : []
      );
      setNews(
        Array.isArray(newsRes.data?.data) ? newsRes.data.data : Array.isArray(newsRes.data) ? newsRes.data : []
      );
      setTestimonials(
        Array.isArray(testRes.data?.data) ? testRes.data.data : Array.isArray(testRes.data) ? testRes.data : []
      );
      setDates(
        Array.isArray(datesRes.data?.data) ? datesRes.data.data : Array.isArray(datesRes.data) ? datesRes.data : []
      );
      setVenue(venueRes.data?.data ?? venueRes.data ?? null);
    }).finally(() => setLoading(false));
  }, [activeEdition, congressLoading]);

  const hp = siteSettings?.homepage;
  const hero = hp?.hero ?? {};
  const stats = hp?.stats?.length ? hp.stats : DEFAULT_STATS;
  const about = hp?.about ?? {};
  const features = hp?.features?.length ? hp.features : DEFAULT_FEATURES;
  const cta = hp?.cta ?? {};

  const congressDate = activeEdition?.startDate || activeEdition?.date;

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />

        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {activeEdition && (
                <div className="flex items-center gap-2 mb-8">
                  <span className="w-2 h-2 bg-teal-400 rounded-sm animate-pulse" />
                  <span className="text-teal-400 text-xs font-bold uppercase tracking-[0.2em]">
                    {activeEdition.name ?? `${activeEdition.year} Edition`}{' '}
                    {hero.tagline || 'Registration Open'}
                  </span>
                </div>
              )}

              <h1 className="font-black leading-none text-white mb-6">
                <span className="block text-5xl sm:text-6xl lg:text-7xl text-slate-400 font-normal">
                  {hero.titleLine1 || "The World's"}
                </span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl text-white">
                  {hero.titleLine2 || 'Aging Science'}
                </span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl text-teal-400">
                  {hero.titleLine3 || 'congress.'}
                </span>
              </h1>

              <div className="w-24 h-1 bg-teal-500 my-7" />

              <p className="text-xl text-slate-300 max-w-xl mb-8 leading-relaxed">
                {hero.subtitle ||
                  'Join world-leading researchers, clinicians, and innovators shaping the future of healthy aging and longevity science.'}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {activeEdition?.startDate && (
                  <div className="flex items-center gap-2 border border-slate-700 px-4 py-2 rounded-lg">
                    <Calendar size={14} className="text-teal-400" />
                    <span className="text-slate-300 text-sm font-medium">
                      {formatDateShort(activeEdition.startDate)}
                      {activeEdition.endDate && ` – ${formatDateShort(activeEdition.endDate)}`}
                    </span>
                  </div>
                )}
                {venue && (
                  <div className="flex items-center gap-2 border border-slate-700 px-4 py-2 rounded-lg">
                    <MapPin size={14} className="text-teal-400" />
                    <span className="text-slate-300 text-sm font-medium">
                      {venue.city}{venue.country ? `, ${venue.country}` : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-10">
                <Button to={hero.ctaPrimaryLink || '/registration'} size="lg" variant="primary">
                  {hero.ctaPrimaryLabel || 'Register Now'} <ArrowRight size={16} />
                </Button>
                <Button
                  to={hero.ctaSecondaryLink || '/abstract-submission'}
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 bg-transparent rounded-lg px-8 py-3 text-base font-semibold transition-all duration-200"
                >
                  {hero.ctaSecondaryLabel || 'Submit Abstract'}
                </Button>
              </div>

              {congressDate && (
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                    {hero.countdownLabel || 'Congress Begins In'}
                  </p>
                  <CountdownTimer targetDate={congressDate} />
                </div>
              )}
            </div>

            {/* Right: Stats grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white/5 border border-white/10 rounded-lg p-7 flex flex-col justify-between"
                >
                  <span className="text-5xl font-black text-white">{value}</span>
                  <span className="text-sm text-slate-400 mt-3 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-teal-700 py-10">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-teal-600">
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center px-6">
                <div className="text-3xl font-black text-white">{value}</div>
                <div className="text-teal-200 text-sm mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOURNEY ── */}
      <JourneySection />

      {/* ── ABOUT ── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionHeader
                label={about.sectionLabel || 'About the congress'}
                title={about.title || 'Uniting Global Experts in Aging Research'}
                subtitle={
                  about.subtitle ||
                  'Our international congress brings together scientists, clinicians, and industry leaders to advance our understanding of aging biology and develop strategies for extending healthy human lifespan.'
                }
                centered={false}
              />
              <div className="flex flex-wrap gap-3 mt-8">
                <Button to="/about" size="lg">
                  Learn More <ArrowRight size={16} />
                </Button>
                <Button to="/sessions" size="lg" variant="outline">
                  View Sessions
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon, title, desc }, i) => {
                const Icon = ICON_MAP[icon] || BookOpen;
                return (
                  <div
                    key={i}
                    className="bg-stone-50 border border-stone-200 rounded-lg p-5 hover:border-teal-400 hover:shadow-md transition-all"
                  >
                    <div className="w-9 h-9 border border-teal-200 bg-teal-50 flex items-center justify-center mb-4">
                      <Icon size={18} className="text-teal-700" />
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mb-1">{title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED SPEAKERS ── */}
      {speakers.length > 0 && (
        <section className="section-padding bg-stone-50 border-t border-stone-100">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <SectionHeader
                label="Featured Speakers"
                title="World-Leading Experts"
                subtitle="Pioneering researchers and clinicians at the forefront of aging science."
                centered={false}
              />
              <Link
                to="/speakers"
                className="hidden lg:flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors shrink-0 mb-12"
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {speakers.slice(0, 8).map((speaker) => (
                <Link
                  key={speaker._id}
                  to={`/speakers/${speaker.slug}`}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Photo */}
                  <div className="relative h-60 w-full overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600">
                    {speaker.photo ? (
                      <>
                        <img
                          src={speaker.photo}
                          alt={speaker.fullName}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl font-bold text-white/85 select-none">{speaker.fullName?.[0] ?? 'S'}</span>
                      </div>
                    )}
                    {/* Arrow badge */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight size={14} className="text-white" />
                    </div>
                    {/* Name on photo bottom */}
                    {speaker.photo && (
                      <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-6">
                        <h3 className="font-bold text-white text-sm leading-snug line-clamp-1">
                          {speaker.fullName}
                        </h3>
                      </div>
                    )}
                  </div>

                  {/* Info below photo */}
                  <div className="p-4">
                    {!speaker.photo && (
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-sm leading-snug line-clamp-1 mb-1">
                        {speaker.fullName}
                      </h3>
                    )}
                    {speaker.designation && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{speaker.designation}</p>
                    )}
                    {speaker.organization && (
                      <p className="text-xs font-semibold text-teal-600 mt-2 line-clamp-1">{speaker.organization}</p>
                    )}
                    {speaker.country && (
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-400">{speaker.country}</span>
                      </div>
                    )}
                  </div>

                  <div className="h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </div>

            <div className="mt-10 lg:hidden">
              <Button to="/speakers" size="lg" variant="secondary">
                View All Speakers <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── IMPORTANT DATES ── */}
      {dates.length > 0 && (
        <section className="section-padding bg-slate-950">
          <div className="container-custom">
            <SectionHeader
              label="Key Deadlines"
              title="Important Dates"
              subtitle="Mark your calendar don't miss these critical congress deadlines."
              light
              centered={false}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dates.slice(0, 6).map((d) => (
                <div
                  key={d._id}
                  className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-teal-700/50 transition-all"
                >
                  <p className="text-amber-400 font-bold text-sm mb-2">{formatDateShort(d.date)}</p>
                  <p className="text-white font-black text-sm leading-snug">{d.label}</p>
                  {d.description && (
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{d.description}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Button to="/important-dates" size="lg" variant="secondary">
                View All Dates <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── LATEST NEWS ── */}
      {news.length > 0 && (
        <section className="section-padding bg-white border-t border-stone-200">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <SectionHeader
                label="Latest News"
                title="Updates & Announcements"
                subtitle="Stay informed with the latest news from the congress and the aging research community."
                centered={false}
              />
              <Link
                to="/news"
                className="hidden lg:flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 shrink-0 mb-12"
              >
                All news <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.slice(0, 3).map((item) => (
                <Link
                  key={item._id}
                  to={`/news/${item.slug}`}
                  className="bg-white border border-stone-200 rounded-lg overflow-hidden hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  {item.featuredImage && (
                    <div className="aspect-[3/2] overflow-hidden">
                      <img
                        src={item.featuredImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {item.tags?.[0] && (
                      <span className="bg-teal-50 text-teal-700 text-xs font-bold px-2 py-0.5 rounded">
                        {item.tags[0]}
                      </span>
                    )}
                    <h3 className="font-black text-slate-900 mt-2 group-hover:text-teal-700 transition-colors line-clamp-2 text-base">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">{item.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-5">
                      <span className="text-xs text-slate-400 font-medium">
                        {formatDateShort(item.publishedAt)}
                      </span>
                      <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
                        Read more <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 lg:hidden">
              <Button to="/news" size="lg" variant="outline">
                All News <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section className="py-20 bg-slate-950 border-t border-slate-800 overflow-hidden">
          <style>{`
            @keyframes marquee-left  { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
            @keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
            .marquee-left  { animation: marquee-left  40s linear infinite; }
            .marquee-right { animation: marquee-right 40s linear infinite; }
            .marquee-left:hover, .marquee-right:hover { animation-play-state: paused; }
          `}</style>

          <div className="container-custom mb-12">
            <SectionHeader
              label="Testimonials"
              title="What Attendees Say"
              subtitle="Voices from past participants at the Aging congress."
              light
            />
          </div>

          {/* Row 1 — scrolls left */}
          <div className="relative mb-5">
            <div className="flex gap-5 marquee-left" style={{ width: 'max-content' }}>
              {[...testimonials, ...testimonials].map((t, i) => (
                <TestimonialCard key={`r1-${i}`} t={t} />
              ))}
            </div>
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />
          </div>

          {/* Row 2 — scrolls right (only if enough items) */}
          {testimonials.length >= 2 && (
            <div className="relative">
              <div className="flex gap-5 marquee-right" style={{ width: 'max-content' }}>
                {[...testimonials, ...testimonials].reverse().map((t, i) => (
                  <TestimonialCard key={`r2-${i}`} t={t} />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-950 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-950 to-transparent z-10" />
            </div>
          )}
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="section-padding bg-teal-700">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label !text-teal-200 !border-teal-400">
                {cta.label || "Don't Miss Out"}
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
                {cta.title || 'Be Part of the Conversation'}
              </h2>
              <p className="text-xl text-teal-100 max-w-lg leading-relaxed">
                {cta.subtitle ||
                  "Register now to secure your place at the world's leading congress on aging science and geroscience research."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:items-start">
              <Button to={cta.primaryLink || '/registration'} size="xl" variant="white">
                {cta.primaryLabel || 'Register Now'} <ArrowRight size={18} />
              </Button>
              <Button
                to={cta.secondaryLink || '/abstract-submission'}
                size="xl"
                className="border-2 border-white/40 text-white hover:bg-white/10 bg-transparent rounded-lg px-10 py-4 text-lg font-semibold transition-all duration-200"
              >
                {cta.secondaryLabel || 'Submit Abstract'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
