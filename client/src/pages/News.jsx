import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import SectionHeader from '../components/ui/SectionHeader';
import { contentAPI } from '../api/content';
import { formatDateShort, truncate } from '../utils/helpers';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

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

  return (
    <div>
      <PageHero
        title="News & Announcements"
        subtitle="Stay up-to-date with the latest from the Aging congress and the aging research community."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'News' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-md mb-10">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title={query ? 'No results found' : 'No news yet'} subtitle="Check back soon for updates." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <Link
                  key={item._id}
                  to={`/news/${item.slug}`}
                  className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-teal-100 transition-all group"
                >
                  {item.image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {item.category && (
                      <span className="text-xs font-bold text-teal-700 uppercase tracking-wide">{item.category}</span>
                    )}
                    <h3 className="font-bold text-slate-900 mt-1 group-hover:text-teal-700 transition-colors line-clamp-2 text-base">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-3">{item.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-slate-400">{formatDateShort(item.publishedAt || item.createdAt)}</span>
                      <span className="text-xs font-semibold text-teal-600 flex items-center gap-1">
                        Read more <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
