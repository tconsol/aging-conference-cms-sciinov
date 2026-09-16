import { useState } from 'react';
import { communityAPI } from '../../api/community';
import { getErrorMessage } from '../../utils/helpers';

export default function NewsletterWidget({ light = false }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await communityAPI.subscribe(email.trim());
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
        Subscribed thank you!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Your email address"
        required
        className={`min-w-0 flex-1 px-3 py-2.5 text-sm outline-none transition-colors ${
          light ? 'placeholder:text-slate-500' : 'placeholder:text-slate-400'
        }`}
        style={{
          background: light ? '#1e293b' : '#ffffff',
          color: light ? '#f1f5f9' : '#0f172a',
          border: `1px solid ${light ? '#334155' : '#e2e8f0'}`,
          borderRight: 'none',
          borderRadius: 0,
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--brand)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = light ? '#334155' : '#e2e8f0'; }}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-opacity disabled:opacity-60"
        style={{
          background: 'var(--brand)',
          border: '1px solid var(--brand)',
          borderRadius: 0,
          whiteSpace: 'nowrap',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
