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
  const [error, setError] = useState(false);

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
        <p className="text-slate-600 text-lg">Article not found.</p>
        <Link to="/news" className="text-teal-700 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero image or gradient */}
      {article.featuredImage ? (
        <div className="w-full aspect-[21/9] overflow-hidden">
          <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 pt-24 pb-16">
          <div className="container-custom">
            <nav className="flex items-center gap-2 text-teal-200 text-sm mb-4">
              <Link to="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link to="/news" className="hover:text-white">News</Link>
              <span>/</span>
              <span className="text-white font-medium">{article.title}</span>
            </nav>
          </div>
        </div>
      )}

      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <Link to="/news" className="inline-flex items-center gap-2 text-teal-700 hover:text-slate-700 text-sm font-medium mb-6 transition-colors">
              <ArrowLeft size={16} /> Back to News
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {article.tags?.[0] && (
                <span className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">
                  <Tag size={10} /> {article.tags[0]}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar size={12} /> {formatDate(article.publishedAt || article.createdAt)}
              </span>
              {article.author && (
                <span className="text-xs text-slate-400">By {article.author}</span>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">{article.title}</h1>

            {article.excerpt && (
              <p className="text-lg text-slate-600 leading-relaxed mb-6 font-medium border-l-4 border-teal-200 pl-4">
                {article.excerpt}
              </p>
            )}

            {article.content && (
              <div
                className="prose prose-slate prose-lg max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
