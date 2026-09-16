import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Save, Eye, EyeOff, ExternalLink, AlertTriangle, Search,
  ChevronRight, ChevronDown,
} from 'lucide-react';
import { visibilityAPI } from '../../api/settings';
import { getErrorMessage } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import StatusToggle from '../../components/ui/StatusToggle';
import Spinner from '../../components/ui/Spinner';

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || '';

function Row({ entry, onToggle }) {
  const [open, setOpen] = useState(false);
  const hidden = !entry.visible;
  // A section with nothing in it disappears from the public site on its own,
  // whatever this switch says — worth stating so the admin is not surprised.
  const emptyNote = entry.autoHidden && entry.visible;
  const hasPreview = entry.items?.length > 0;
  const moreCount = (entry.count || 0) - (entry.items?.length || 0);

  return (
    <div
      className={`flex items-start gap-4 px-4 py-3.5 border-b border-slate-100 last:border-b-0 transition-colors ${
        hidden ? 'bg-slate-50/70' : 'bg-white'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${hidden ? 'text-slate-400' : 'text-slate-800'}`}>
            {entry.label}
          </span>

          {entry.count !== null && (
            <span
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                entry.count === 0 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {entry.count} {entry.count === 1 ? 'item' : 'items'}
            </span>
          )}

          {entry.path && CLIENT_URL && (
            <a
              href={`${CLIENT_URL.replace(/\/$/, '')}${entry.path}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-teal-600 transition-colors"
              aria-label={`Open ${entry.label} on the public site`}
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        <p className={`text-xs mt-0.5 ${hidden ? 'text-slate-400' : 'text-slate-500'}`}>
          {entry.description}
        </p>

        {emptyNote && (
          <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
            <AlertTriangle size={11} /> No content — hidden automatically until something is added.
          </p>
        )}

        {/* What actually disappears if this is switched off. */}
        {hasPreview && (
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800"
            >
              {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              {open ? 'Hide preview' : `Preview what ${hidden ? 'is hidden' : 'will be hidden'}`}
            </button>

            {open && (
              <ul className="mt-2 rounded-lg border border-slate-200 bg-slate-50 divide-y divide-slate-200 overflow-hidden">
                {entry.items.map((item, i) => (
                  <li key={i} className="px-3 py-1.5 text-[11px] text-slate-600 leading-relaxed">
                    {item}
                  </li>
                ))}
                {moreCount > 0 && (
                  <li className="px-3 py-1.5 text-[11px] text-slate-400 italic">
                    + {moreCount} more…
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 pt-0.5">
        <StatusToggle isActive={entry.visible} onToggle={() => onToggle(entry.key)} />
      </div>
    </div>
  );
}

export default function Visibility() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [q, setQ] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await visibilityAPI.getAdmin();
      setEntries(res.data?.data || []);
      setDirty(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = (key) => {
    setEntries((prev) => prev.map((e) => e.key === key ? { ...e, visible: !e.visible } : e));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = entries.reduce((acc, e) => { acc[e.key] = e.visible; return acc; }, {});
      await visibilityAPI.update(payload);
      setDirty(false);
      toast.success('Visibility saved. The public site updates on next load.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((e) =>
      e.label.toLowerCase().includes(needle) ||
      (e.description || '').toLowerCase().includes(needle));
  }, [entries, q]);

  const pages = filtered.filter((e) => e.type === 'page');
  const sections = filtered.filter((e) => e.type === 'section');
  const hiddenCount = entries.filter((e) => !e.visible).length;

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="Page & Section Visibility"
        subtitle="Switch parts of the public website on or off. Empty sections hide themselves automatically."
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a page or section…"
            className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-teal-500"
          />
        </div>
        <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
          {hiddenCount > 0
            ? <><EyeOff size={13} /> {hiddenCount} hidden</>
            : <><Eye size={13} /> Everything visible</>}
        </span>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-2">
          Pages <span className="font-normal text-slate-400">({pages.length})</span>
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {pages.length === 0
            ? <p className="px-4 py-6 text-sm text-slate-400 text-center">No pages match “{q}”.</p>
            : pages.map((e) => <Row key={e.key} entry={e} onToggle={toggle} />)}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-2">
          Sections <span className="font-normal text-slate-400">({sections.length})</span>
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {sections.length === 0
            ? <p className="px-4 py-6 text-sm text-slate-400 text-center">No sections match “{q}”.</p>
            : sections.map((e) => <Row key={e.key} entry={e} onToggle={toggle} />)}
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Hiding a page also removes it from the site navigation and shows a
        &ldquo;not available&rdquo; notice to anyone who has the direct link.
      </p>

      {/* Floating save. The list runs to 41 rows, so a save button pinned to the
          top scrolls out of reach exactly when it is needed. Only mounted while
          there is something to save, so it never sits there as dead furniture.
          Extra bottom padding keeps it clear of the last row underneath it. */}
      {dirty && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 shadow-sm">
            <AlertTriangle size={12} /> Unsaved changes
          </span>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
            style={{ background: 'var(--brand-dark, #0f766e)', boxShadow: '0 10px 30px rgba(15,118,110,0.35)' }}
          >
            <Save size={15} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}
      {/* Room to scroll past the floating button */}
      <div className="h-16" />
    </div>
  );
}
