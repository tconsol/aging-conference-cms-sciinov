import { Link } from 'react-router-dom';
import { EyeOff, ArrowLeft } from 'lucide-react';
import { usecongress } from '../../context/congressContext';
import Spinner from '../ui/Spinner';
import Seo from '../Seo';

/**
 * Wraps a route whose page can be switched off in the admin panel.
 *
 * Hiding the nav link alone is not enough — the URL stays guessable, and search
 * engines keep any link they already have. A hidden page therefore renders a
 * real "not available" screen rather than its content.
 *
 * While settings are still loading nothing is rendered but a spinner: flashing
 * the page and then replacing it with "unavailable" is worse than a brief wait.
 */
export default function VisibilityRoute({ pageKey, children }) {
  const { isVisible, loading } = usecongress();

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isVisible(pageKey)) {
    return (
      <>
      {/* A switched-off page must not stay in the index. */}
      <Seo title="Page Not Available" noindex />
      <div className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-lg mx-auto text-center py-16">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'var(--brand-light)' }}
            >
              <EyeOff size={28} style={{ color: 'var(--brand-dark)' }} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-3">Page Not Available</h1>
            <p className="text-slate-500 leading-relaxed mb-8">
              This page isn&apos;t published at the moment. It may return later in the
              congress cycle.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-colors"
              style={{ background: 'var(--brand-dark)' }}
            >
              <ArrowLeft size={15} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
      </>
    );
  }

  return children;
}
