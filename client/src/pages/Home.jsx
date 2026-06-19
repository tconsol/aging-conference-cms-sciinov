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
} from 'lucide-react';
import { usecongress } from '../context/congressContext';
import { congressAPI } from '../api/congress';
import { peopleAPI } from '../api/people';
import { contentAPI } from '../api/content';
import { communityAPI } from '../api/community';
import CountdownTimer from '../components/ui/CountdownTimer';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import { formatDateShort, truncate } from '../utils/helpers';

const STATS = [
  { label: 'Attendees', value: '1,200+' },
  { label: 'Speakers', value: '60+' },
  { label: 'Countries', value: '45+' },
  { label: 'Sessions', value: '30+' },
];

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Research Sessions',
    desc: 'Cutting-edge presentations across all areas of geroscience',
  },
  {
    icon: Mic,
    title: 'Keynote Speakers',
    desc: 'Nobel laureates and leading researchers from top institutions',
  },
  {
    icon: Users,
    title: 'Global Networking',
    desc: 'Connect with peers from 45+ countries worldwide',
  },
  {
    icon: Award,
    title: 'Research Awards',
    desc: 'Recognizing excellence in aging research and innovation',
  },
];

export default function Home() {
  const { activeEdition } = usecongress();
  const [speakers, setSpeakers] = useState([]);
  const [news, setNews] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [dates, setDates] = useState([]);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        Array.isArray(spRes.data?.data)
          ? spRes.data.data
          : Array.isArray(spRes.data)
          ? spRes.data
          : []
      );
      setNews(
        Array.isArray(newsRes.data?.data)
          ? newsRes.data.data
          : Array.isArray(newsRes.data)
          ? newsRes.data
          : []
      );
      setTestimonials(
        Array.isArray(testRes.data?.data)
          ? testRes.data.data
          : Array.isArray(testRes.data)
          ? testRes.data
          : []
      );
      setDates(
        Array.isArray(datesRes.data?.data)
          ? datesRes.data.data
          : Array.isArray(datesRes.data)
          ? datesRes.data
          : []
      );
      setVenue(venueRes.data?.data ?? venueRes.data ?? null);
    }).finally(() => setLoading(false));
  }, [activeEdition]);

  const congressDate = activeEdition?.startDate || activeEdition?.date;

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center bg-slate-950 overflow-hidden">
        {/* Fine grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Teal left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />

        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Main content */}
            <div>
              {activeEdition && (
                <div className="flex items-center gap-2 mb-8">
                  <span className="w-2 h-2 bg-teal-400 rounded-sm animate-pulse" />
                  <span className="text-teal-400 text-xs font-bold uppercase tracking-[0.2em]">
                    {activeEdition.name ?? `${activeEdition.year} Edition`} Registration Open
                  </span>
                </div>
              )}

              <h1 className="font-black leading-none text-white mb-6">
                <span className="block text-5xl sm:text-6xl lg:text-7xl text-slate-400 font-normal">
                  The World's
                </span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl text-white">
                  Aging Science
                </span>
                <span className="block text-6xl sm:text-7xl lg:text-8xl text-teal-400">
                  congress.
                </span>
              </h1>

              {/* Teal rule */}
              <div className="w-24 h-1 bg-teal-500 my-7" />

              <p className="text-xl text-slate-300 max-w-xl mb-8 leading-relaxed">
                Join world-leading researchers, clinicians, and innovators shaping the future of
                healthy aging and longevity science.
              </p>

              {/* Location / date */}
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
                      {venue.city}
                      {venue.country ? `, ${venue.country}` : ''}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Button to="/registration" size="lg" variant="primary">
                  Register Now <ArrowRight size={16} />
                </Button>
                <Button
                  to="/abstract-submission"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 bg-transparent rounded-lg px-8 py-3 text-base font-semibold transition-all duration-200"
                >
                  Submit Abstract
                </Button>
              </div>

              {/* Countdown */}
              {congressDate && (
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                    congress Begins In
                  </p>
                  <CountdownTimer targetDate={congressDate} />
                </div>
              )}
            </div>

            {/* Right: Stats grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {STATS.map(({ label, value }) => (
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
            {STATS.map(({ label, value }) => (
              <div key={label} className="text-center px-6">
                <div className="text-3xl font-black text-white">{value}</div>
                <div className="text-teal-200 text-sm mt-1 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionHeader
                label="About the congress"
                title="Uniting Global Experts in Aging Research"
                subtitle="Our international congress brings together scientists, clinicians, and industry leaders to advance our understanding of aging biology and develop strategies for extending healthy human lifespan."
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
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-stone-50 border border-stone-200 rounded-lg p-5 hover:border-teal-400 hover:shadow-md transition-all"
                >
                  <div className="w-9 h-9 border border-teal-200 bg-teal-50 flex items-center justify-center mb-4">
                    <Icon size={18} className="text-teal-700" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">{title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED SPEAKERS ── */}
      {speakers.length > 0 && (
        <section className="section-padding bg-stone-50 border-t border-stone-200">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <SectionHeader
                label="Featured Speakers"
                title="World-Leading Experts"
                subtitle="Hear from pioneering researchers and clinicians at the forefront of aging science."
                centered={false}
              />
              <Link
                to="/speakers"
                className="hidden lg:flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 shrink-0 mb-12"
              >
                All speakers <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {speakers.slice(0, 6).map((speaker) => (
                <Link
                  key={speaker._id}
                  to={`/speakers/${speaker.slug}`}
                  className="bg-white border border-stone-200 rounded-lg overflow-hidden hover:border-teal-400 hover:shadow-lg transition-all group"
                >
                  {/* Photo / Avatar */}
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-teal-50 to-stone-100 overflow-hidden">
                    {speaker.photo ? (
                      <img
                        src={speaker.photo}
                        alt={speaker.fullName}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <div className="w-20 h-20 rounded-lg bg-teal-700 flex items-center justify-center">
                          <span className="text-white font-black text-3xl">
                            {speaker.fullName?.[0] ?? 'S'}
                          </span>
                        </div>
                      </div>
                    )}
                    {speaker.isFeatured && (
                      <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-black text-slate-900 group-hover:text-teal-700 transition-colors text-base leading-tight">
                      {speaker.fullName}
                    </h3>
                    {speaker.designation && (
                      <p className="text-xs text-teal-600 font-semibold mt-1 leading-snug">
                        {speaker.designation}
                      </p>
                    )}
                    {speaker.organization && (
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {speaker.organization}
                      </p>
                    )}
                    {speaker.country && (
                      <p className="text-xs text-slate-400 mt-1 font-medium">{speaker.country}</p>
                    )}
                  </div>
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
                  <p className="text-amber-400 font-bold text-sm mb-2">
                    {formatDateShort(d.date)}
                  </p>
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
        <section className="section-padding bg-stone-50 border-t border-stone-200">
          <div className="container-custom">
            <SectionHeader
              label="Testimonials"
              title="What Attendees Say"
              subtitle="Hear from past participants about their experience at the Aging congress."
              centered={false}
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.slice(0, 3).map((t) => (
                <div
                  key={t._id}
                  className="bg-white border border-stone-200 rounded-lg p-6 hover:border-teal-400 hover:shadow-md transition-all"
                >
                  {/* Open-quote mark */}
                  <div className="text-teal-200 text-6xl font-black leading-none mb-2 select-none">
                    &ldquo;
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-5">
                    {truncate(t.message || t.content, 180)}
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                    {t.photo ? (
                      <img
                        src={t.photo}
                        alt={t.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-black text-sm">{t.name?.[0] ?? 'A'}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-black text-slate-900">{t.name}</p>
                      {(t.designation || t.country) && (
                        <p className="text-xs text-slate-500">
                          {[t.designation, t.country].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ── */}
      <section className="section-padding bg-teal-700">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label !text-teal-200 !border-teal-400">
                Don't Miss Out
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
                Be Part of the Conversation
              </h2>
              <p className="text-xl text-teal-100 max-w-lg leading-relaxed">
                Register now to secure your place at the world's leading congress on aging
                science and geroscience research.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:items-start">
              <Button to="/registration" size="xl" variant="white">
                Register Now <ArrowRight size={18} />
              </Button>
              <Button
                to="/abstract-submission"
                size="xl"
                className="border-2 border-white/40 text-white hover:bg-white/10 bg-transparent rounded-lg px-10 py-4 text-lg font-semibold transition-all duration-200"
              >
                Submit Abstract
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
