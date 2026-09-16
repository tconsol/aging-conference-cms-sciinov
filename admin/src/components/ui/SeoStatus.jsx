import { Search, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

// Google truncates around these lengths; outside the range the snippet either
// gets cut off or looks thin.
const LIMITS = {
  title: { min: 20, max: 60 },
  description: { min: 70, max: 160 },
};

const check = (value, { min, max }) => {
  const len = (value || '').trim().length;
  if (!len) return { tone: 'bad', text: 'Not set' };
  if (len < min) return { tone: 'warn', text: `${len} chars — a little short` };
  if (len > max) return { tone: 'warn', text: `${len} chars — may be truncated` };
  return { tone: 'good', text: `${len} chars` };
};

const TONE = {
  good: { color: '#15803d', Icon: CheckCircle2 },
  warn: { color: '#b45309', Icon: AlertTriangle },
  bad:  { color: '#b91c1c', Icon: AlertTriangle },
};

function Line({ label, result }) {
  const { color, Icon } = TONE[result.tone];
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon size={13} style={{ color }} className="shrink-0" />
      <span className="font-semibold text-slate-700">{label}</span>
      <span style={{ color }}>{result.text}</span>
    </div>
  );
}

/**
 * Live feedback on the SEO fields, shown beside them so the admin can see at a
 * glance whether search engines have anything useful to work with.
 */
export default function SeoStatus({ title, description, keywords }) {
  const titleResult = check(title, LIMITS.title);
  const descResult = check(description, LIMITS.description);
  const keywordCount = (keywords || '').split(',').map((k) => k.trim()).filter(Boolean).length;
  const keywordResult = keywordCount === 0
    ? { tone: 'bad', text: 'Not set' }
    : keywordCount < 3
      ? { tone: 'warn', text: `${keywordCount} keyword${keywordCount === 1 ? '' : 's'} — add a few more` }
      : { tone: 'good', text: `${keywordCount} keywords` };

  const incomplete = [titleResult, descResult, keywordResult].some((r) => r.tone === 'bad');

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Search size={14} className="text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800">Search Engine Readiness</h3>
      </div>

      <div className="space-y-1.5 mb-3">
        <Line label="Meta title" result={titleResult} />
        <Line label="Meta description" result={descResult} />
        <Line label="Keywords" result={keywordResult} />
      </div>

      {incomplete && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 leading-relaxed">
          Fill these in — they are what appears in Google results. Without them
          search engines invent a snippet from whatever text they find first.
        </p>
      )}

      <div className="text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-3 space-y-1.5">
        <p className="flex items-start gap-1.5">
          <RefreshCw size={12} className="mt-0.5 shrink-0" />
          <span>
            After adding pages, speakers, sessions, news or reports, ask your
            developer to re-run <code className="font-mono bg-white px-1 rounded">npm run seo:sitemap</code> so
            search engines pick up the new URLs.
          </span>
        </p>
        <p>
          Hidden pages are automatically marked <strong>noindex</strong> and left out
          of the sitemap.
        </p>
      </div>
    </div>
  );
}
