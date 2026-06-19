import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { communityAPI } from '../../api/community';
import { getErrorMessage } from '../../utils/helpers';

export default function NewsletterWidget({ light = false }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await communityAPI.subscribe(email);
      setDone(true);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <p className={`text-sm font-semibold ${light ? 'text-teal-300' : 'text-teal-700'}`}>
        Subscribed thank you.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-0">
      <div className="relative flex-1">
        <Mail
          size={14}
          className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            light ? 'text-slate-500' : 'text-slate-400'
          }`}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          className={`w-full h-10 pl-9 pr-3 rounded-l-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 ${
            light
              ? 'bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:ring-teal-400'
              : 'bg-white border-stone-200 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="h-10 px-4 rounded-r-lg bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center gap-1.5"
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <ArrowRight size={14} />
        )}
      </button>
    </form>
  );
}
