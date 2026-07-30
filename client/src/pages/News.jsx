import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Newspaper, Tag } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import SectionHeader from '../components/ui/SectionHeader';
import { contentAPI } from '../api/content';
import { formatDateShort } from '../utils/helpers';

function FeaturedCard({ item }) {
  return (
    <Link
      to={`/news/${item.slug}`}
      className="group grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-white"
    >
      <div className="relative aspect-[16/9] lg:aspect-auto lg:min-h-[280px] overflow-hidden"
        style={{ background: 'var(--brand-light)' }}
      >
        {item.featuredImage ? (
          <img
            src={item.featuredImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper size={56} style={{ color: 'var(--brand)' }} className="opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        <div
          className="absolute top-4 left-4 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white"
          style={{ background: 'var(--brand-dark)' }}
        >
          Featured
        </div>
      </div>
      <div className="p-7 lg:p-10 flex flex-col justify-between">
        <div>
          {item.tags?.[0] && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest mb-4"
              style={{ color: 'var(--brand)' }}
            >
              <Tag size={11} /> {item.tags[0]}
            </span>
          )}
          <h2 className="text-2xl font-black text-slate-900 leading-snug group-hover:text-slate-700 transition-colors line-clamp-3 mb-3">
            {item.title}
          </h2>
          {item.excerpt && (
            <p className="text-slate-500 leading-relaxed line-clamp-3 text-sm">{item.excerpt}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-7 pt-5 border-t border-slate-100">
          <span className="text-xs font-medium text-slate-400">
            {formatDateShort(item.publicationDate || item.publishedAt || item.createdAt)}
          </span>
          <span
            className="flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all"
            style={{ color: 'var(--brand-dark)' }}
          >
            Read story <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function NewsCard({ item }) {
  return (
    <Link
      to={`/news/${item.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{ background: 'var(--brand-light)' }}
      >
        {item.featuredImage ? (
          <img
            src={item.featuredImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper size={32} style={{ color: 'var(--brand)' }} className="opacity-25" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {item.tags?.[0] && (
          <span
            className="text-[11px] font-black uppercase tracking-widest mb-2"
            style={{ color: 'var(--brand)' }}
          >
            {item.tags[0]}
          </span>
        )}
        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-slate-600 transition-colors mb-2 flex-1">
          {item.title}
        </h3>
        {item.excerpt && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">{item.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <span className="text-xs text-slate-400">{formatDateShort(item.publicationDate || item.publishedAt || item.createdAt)}</span>
          <span
            className="text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--brand-dark)' }}
          >
            Read <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function News() {
  const [news, setNews]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState('');

  useEffect(() => {
    contentAPI.getNews()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setNews(Array.isArray(data) ? data : []);
      })
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = news.filter((n) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.excerpt?.toLowerCase().includes(q);
  });

  const [featured, ...rest] = filtered;

  return (
    <div>
      <PageHero
        title="News & Announcements"
        subtitle="Stay up-to-date with the latest from the Aging Congress and the aging research community."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'News' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {/* Search + count */}
          <div className="flex items-center gap-4 mb-10 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                onFocus={(e) => { e.target.style.borderColor = 'var(--brand)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand) 20%, transparent)'; }}
                onBlur={(e) => { e.target.style.borderColor = ''; e.target.style.boxShadow = ''; }}
              />
            </div>
            {!loading && (
              <p className="text-sm text-slate-400">{filtered.length} {filtered.length === 1 ? 'article' : 'articles'}</p>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader
                title={query ? 'No results found' : 'No news yet'}
                subtitle={query ? 'Try different search terms.' : 'Check back soon for updates.'}
              />
              {query && (
                <button onClick={() => setQuery('')} className="mt-4 text-sm font-semibold hover:underline" style={{ color: 'var(--brand-dark)' }}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {/* Featured article */}
              {featured && !query && <FeaturedCard item={featured} />}

              {/* Rest of articles */}
              {(query ? filtered : rest).length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {(query ? filtered : rest).map((item) => (
                    <NewsCard key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
