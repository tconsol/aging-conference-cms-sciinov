import {
  Plus, Trash2, GripVertical,
  Target, Globe, Heart, BookOpen, Users, Award,
  Microscope, Stethoscope, GraduationCap, Briefcase, Landmark, CheckCircle,
} from 'lucide-react';
import Select from './Select';
import Spinner from './Spinner';

// Must stay in step with the ICONS map in client/src/pages/About.jsx — anything
// not listed there renders as the fallback icon on the public page.
const ICON_CHOICES = {
  Target, Globe, Heart, BookOpen, Users, Award,
  Microscope, Stethoscope, GraduationCap, Briefcase, Landmark, CheckCircle,
};
const ICON_NAMES = Object.keys(ICON_CHOICES);

const EMPTY = {
  stats:    { value: '', label: '' },
  values:   { icon: 'Target', label: '', title: '', desc: '' },
  audience: { icon: 'Microscope', title: '', desc: '' },
};

const inputCls =
  'w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500 transition-colors';

const ICON_OPTIONS = ICON_NAMES.map((n) => ({ value: n, label: n }));

function IconSelect({ value, onChange }) {
  const Current = ICON_CHOICES[value] || Target;
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
        <Current size={17} className="text-teal-700" />
      </span>
      <div className="flex-1 min-w-0">
        <Select
          options={ICON_OPTIONS}
          value={ICON_NAMES.includes(value) ? value : 'Target'}
          onChange={onChange}
          placeholder="Select icon..."
        />
      </div>
    </div>
  );
}

function SectionCard({ title, description, children, onAdd, addLabel }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors shrink-0"
        >
          <Plus size={13} /> {addLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function RowShell({ index, onRemove, onMove, total, children }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border border-slate-100 bg-slate-50/60">
      <div className="flex flex-col items-center gap-0.5 pt-1.5 shrink-0">
        <GripVertical size={13} className="text-slate-300" />
        <button
          type="button"
          onClick={() => onMove(index, -1)}
          disabled={index === 0}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30"
          aria-label="Move up"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={() => onMove(index, 1)}
          disabled={index === total - 1}
          className="text-[10px] font-bold text-slate-400 hover:text-slate-700 disabled:opacity-30"
          aria-label="Move down"
        >
          ▼
        </button>
      </div>
      <div className="flex-1 min-w-0 space-y-2">{children}</div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
        aria-label="Remove"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/**
 * Controlled. The parent owns the data and the single Save button — an earlier
 * version saved itself, which meant picking an image above and then clicking
 * this component's own save silently discarded the image.
 */
export default function AboutSectionsEditor({ value, onChange, loading = false }) {
  const stats    = value?.stats    || [];
  const values   = value?.values   || [];
  const benefits = value?.benefits || [];
  const audience = value?.audience || [];

  const setStats    = (next) => onChange({ ...value, stats: next });
  const setValues   = (next) => onChange({ ...value, values: next });
  const setBenefits = (next) => onChange({ ...value, benefits: next });
  const setAudience = (next) => onChange({ ...value, audience: next });

  // One generic set of list helpers rather than four near-identical copies.
  const makeHandlers = (list, setList, empty) => ({
    add:    () => setList([...list, { ...empty }]),
    remove: (i) => setList(list.filter((_, idx) => idx !== i)),
    patch:  (i, key, val) => setList(list.map((row, idx) => idx === i ? { ...row, [key]: val } : row)),
    move:   (i, dir) => {
      const j = i + dir;
      if (j < 0 || j >= list.length) return;
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      setList(next);
    },
  });

  const S = makeHandlers(stats, setStats, EMPTY.stats);
  const V = makeHandlers(values, setValues, EMPTY.values);
  const A = makeHandlers(audience, setAudience, EMPTY.audience);

  const benefitHandlers = {
    add:    () => setBenefits([...benefits, '']),
    remove: (i) => setBenefits(benefits.filter((_, idx) => idx !== i)),
    set:    (i, val) => setBenefits(benefits.map((b, idx) => idx === i ? val : b)),
    move:   (i, dir) => {
      const j = i + dir;
      if (j < 0 || j >= benefits.length) return;
      const next = [...benefits];
      [next[i], next[j]] = [next[j], next[i]];
      setBenefits(next);
    },
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-800">About Page Sections</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Stats, values, benefits and audience shown on the public About page.
          Empty sections fall back to the built-in defaults. Saved with
          <strong> Save Page</strong> at the top.
        </p>
      </div>

      {/* Stats */}
      <SectionCard
        title="Stats"
        description="The number band under the mission text. Numbers count up on scroll."
        onAdd={S.add}
        addLabel="Add stat"
      >
        {stats.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No stats — the page will use its defaults.</p>
        ) : (
          <div className="space-y-2">
            {stats.map((row, i) => (
              <RowShell key={i} index={i} total={stats.length} onRemove={S.remove} onMove={S.move}>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    className={inputCls} placeholder="Value, e.g. 1,200+"
                    value={row.value || ''} onChange={(e) => S.patch(i, 'value', e.target.value)}
                  />
                  <input
                    className={inputCls} placeholder="Label, e.g. Annual Attendees"
                    value={row.label || ''} onChange={(e) => S.patch(i, 'label', e.target.value)}
                  />
                </div>
              </RowShell>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Values */}
      <SectionCard
        title="Our Values"
        description="The icon grid under “What We Stand For”."
        onAdd={V.add}
        addLabel="Add value"
      >
        {values.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No values — the page will use its defaults.</p>
        ) : (
          <div className="space-y-2">
            {values.map((row, i) => (
              <RowShell key={i} index={i} total={values.length} onRemove={V.remove} onMove={V.move}>
                <div className="grid sm:grid-cols-2 gap-2">
                  <IconSelect value={row.icon} onChange={(v) => V.patch(i, 'icon', v)} />
                  <input
                    className={inputCls} placeholder="Number, e.g. 01"
                    value={row.label || ''} onChange={(e) => V.patch(i, 'label', e.target.value)}
                  />
                </div>
                <input
                  className={inputCls} placeholder="Title, e.g. Scientific Excellence"
                  value={row.title || ''} onChange={(e) => V.patch(i, 'title', e.target.value)}
                />
                <textarea
                  rows={2} placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500 resize-none"
                  value={row.desc || ''} onChange={(e) => V.patch(i, 'desc', e.target.value)}
                />
              </RowShell>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Benefits */}
      <SectionCard
        title="Benefits — Why You Should Attend"
        description="Ticked list in the left card. One line each."
        onAdd={benefitHandlers.add}
        addLabel="Add benefit"
      >
        {benefits.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No benefits — the page will use its defaults.</p>
        ) : (
          <div className="space-y-2">
            {benefits.map((row, i) => (
              <RowShell
                key={i} index={i} total={benefits.length}
                onRemove={benefitHandlers.remove} onMove={benefitHandlers.move}
              >
                <input
                  className={inputCls} placeholder="e.g. Keynotes from world-leading researchers"
                  value={row} onChange={(e) => benefitHandlers.set(i, e.target.value)}
                />
              </RowShell>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Audience */}
      <SectionCard
        title="Audience — Built for the Whole Community"
        description="The list in the dark card on the right."
        onAdd={A.add}
        addLabel="Add audience"
      >
        {audience.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No audience entries — the page will use its defaults.</p>
        ) : (
          <div className="space-y-2">
            {audience.map((row, i) => (
              <RowShell key={i} index={i} total={audience.length} onRemove={A.remove} onMove={A.move}>
                <IconSelect value={row.icon} onChange={(v) => A.patch(i, 'icon', v)} />
                <input
                  className={inputCls} placeholder="Title, e.g. Researchers & Scientists"
                  value={row.title || ''} onChange={(e) => A.patch(i, 'title', e.target.value)}
                />
                <textarea
                  rows={2} placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-teal-500 resize-none"
                  value={row.desc || ''} onChange={(e) => A.patch(i, 'desc', e.target.value)}
                />
              </RowShell>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
