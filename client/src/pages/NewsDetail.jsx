import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';
import { formatDate } from '../utils/helpers';

export default function NewsDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    contentAPI.getNewsBySlug(slug)
      .then((res) => setArticle(res.data?.data ?? res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]"><Spinner size="lg" /></div>;
  }

  if (error || !article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-lg font-semibold">Article not found.</p>
        <Link to="/news" className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-dark)' }}>
          <ArrowLeft size={16} /> Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Featured image / hero */}
      {article.featuredImage ? (
        <div className="w-full max-h-[480px] overflow-hidden">
          <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div
          className="pt-20 pb-14"
          style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)' }}
        >
          <div className="container-custom">
            <nav className="flex items-center gap-2 text-sm mb-4 opacity-60">
              <Link to="/" className="text-white hover:opacity-80">Home</Link>
              <span className="text-white">/</span>
              <Link to="/news" className="text-white hover:opacity-80">News</Link>
              <span className="text-white">/</span>
              <span className="text-white font-medium truncate max-w-[200px]">{article.title}</span>
            </nav>
          </div>
        </div>
      )}

      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            {/* Back */}
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-sm font-bold mb-8 transition-opacity hover:opacity-70"
              style={{ color: 'var(--brand-dark)' }}
            >
              <ArrowLeft size={15} /> All News
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {article.tags?.[0] && (
                <span
                  className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)' }}
                >
                  <Tag size={9} /> {article.tags[0]}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar size={12} /> {formatDate(article.publicationDate || article.publishedAt || article.createdAt)}
              </span>
              {article.author && (
                <span className="text-xs text-slate-400">By {article.author}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight mb-5" style={{ textWrap: 'balance' }}>
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p
                className="text-lg text-slate-600 leading-relaxed mb-8 pl-5"
                style={{ borderLeft: '4px solid var(--brand)' }}
              >
                {article.excerpt}
              </p>
            )}

            {/* Body */}
            {article.content && (
              <div
                className="prose prose-slate prose-lg max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}

            {/* Footer */}
            <div className="mt-10 pt-7 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
                style={{ color: 'var(--brand-dark)' }}
              >
                <ArrowLeft size={14} /> All Articles
              </Link>
              {article.tags?.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: '#f8fafc', color: '#64748b' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
