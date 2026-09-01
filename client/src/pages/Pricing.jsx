import { useEffect, useState, useMemo } from 'react';
import { ArrowRight, Check, CalendarClock } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Spinner from '../components/ui/Spinner';
import DeadlineBadge from '../components/ui/DeadlineBadge';
import { submissionsAPI } from '../api/submissions';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';
import { categoryLabel } from '../utils/helpers';
import { deadlineState, formatDeadline } from '../utils/deadline';

const TIER_LABELS = {
  early_bird: 'Early Bird',
  mid_term: 'Mid Term',
  on_spot: 'On Spot',
};

const TIER_ORDER = ['early_bird', 'mid_term', 'on_spot'];

const CATEGORY_ORDER = [
  'oral_inperson', 'oral_virtual', 'poster_inperson', 'poster_virtual',
  'listener_inperson', 'listener_virtual', 'student',
];

const INCLUDES_INPERSON = [
  'Access to all conference sessions, poster, and exhibition areas',
  'Conference kit including name tag, program booklet, and Abstract Book',
  '2 coffee breaks and lunch for all conference days',
  'Certificate accreditation from the Organizing Committee',
];

const INCLUDES_VIRTUAL = [
  'Present at the conference virtually from home or work without attending in person',
  'Access to all presentations',
  'E-Abstract Book and Program',
  'E-Certificate for Presentation and Participation',
];

const money = (n) => `$${Number(n).toLocaleString()}`;

/**
 * How far "now" sits through a tier's open window, 0-1.
 * A tier opens when the previous one closes; the first tier falls back to a
 * 90-day run-up when it has no recorded start.
 */
function windowProgress(start, end) {
  if (!end) return null;
  const e = new Date(end).getTime();
  const s = start ? new Date(start).getTime() : e - 90 * 86400000;
  if (!Number.isFinite(e) || !Number.isFinite(s) || e <= s) return null;
  return Math.min(1, Math.max(0, (Date.now() - s) / (e - s)));
}

function TierHead({ tier, prevEnd, index }) {
  const live = tier.isActive;
  const end = tier.endDate || tier.deadline;
  const state = deadlineState(end);
  const closed = state?.isClosed;
  const progress = windowProgress(tier.startDate || prevEnd, end);

  return (
    <div
      className="reg-rise px-5 py-6 h-full flex flex-col"
      style={{
        animationDelay: `${0.15 + index * 0.08}s`,
        background: live ? 'var(--brand-dark)' : '#f8fafc',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <span
          className="text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ color: live ? 'rgba(255,255,255,0.55)' : '#94a3b8' }}
        >
          Tier {String(index + 1).padStart(2, '0')}
        </span>
        {live && (
          <span className="text-[10px] font-black uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded-full shrink-0">
            Open
          </span>
        )}
      </div>

      <h3
        className="font-black leading-tight mb-1"
        style={{
          fontSize: 'clamp(1.05rem, 1.7vw, 1.3rem)',
          color: live ? '#fff' : '#1e293b',
        }}
      >
        {tier.label || TIER_LABELS[tier.name] || tier.name}
      </h3>

      {end && (
        <p className="text-xs mb-4" style={{ color: live ? 'rgba(255,255,255,0.7)' : '#94a3b8' }}>
          {closed ? 'Closed' : 'Closes'} {formatDeadline(end)}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        {progress !== null && (
          <div
            className="reg-meter"
            style={{
              color: live ? '#fff' : 'var(--brand)',
              background: live ? 'rgba(255,255,255,0.22)' : '#e2e8f0',
            }}
            aria-hidden="true"
          >
            <div
              className="reg-meter-fill"
              style={{ width: `${progress * 100}%`, animationDelay: `${0.45 + index * 0.08}s` }}
            />
          </div>
        )}
        {state && <DeadlineBadge date={end} compact />}
      </div>
    </div>
  );
}

export default function Pricing() {
  const { activeEdition } = usecongress();
  const [tiers, setTiers] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState('all');

  useEffect(() => {
    if (!activeEdition?._id) { setTiers([]); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      submissionsAPI.getPricing({ edition: activeEdition._id }).catch(() => null),
      congressAPI.getImportantDates({ edition: activeEdition._id }).catch(() => null),
    ])
      .then(([p, d]) => {
        setTiers(p?.data?.data ?? p?.data ?? []);
        setDates(d?.data?.data ?? d?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [activeEdition]);

  const orderedTiers = useMemo(() => {
    const list = Array.isArray(tiers) ? [...tiers] : [];
    return list.sort((a, b) => {
      const ai = TIER_ORDER.indexOf(a.name);
      const bi = TIER_ORDER.indexOf(b.name);
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return new Date(a.endDate || a.deadline || 0) - new Date(b.endDate || b.deadline || 0);
    });
  }, [tiers]);

  // Every category priced in any tier, so rows line up across the table
  const categories = useMemo(() => {
    const seen = new Set();
    orderedTiers.forEach((t) =>
      Object.entries(t.prices || {}).forEach(([cat, amt]) => { if (amt > 0) seen.add(cat); })
    );
    return [...seen].sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [orderedTiers]);

  const visibleTiers = selectedTier === 'all'
    ? orderedTiers
    : orderedTiers.filter((t) => t.name === selectedTier);

  const registrationDates = dates.filter((d) => d.category === 'registrations');
  const gridCols = `minmax(190px, 1.5fr) repeat(${visibleTiers.length}, minmax(135px, 1fr))`;

  return (
    <div>
      <PageHero
        title="Registration Pricing"
        subtitle="Fees are grouped into windows. Each closes on the date shown, and the rate rises when it does."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : orderedTiers.length === 0 ? (
            <div className="max-w-lg py-12">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Pricing coming soon</h2>
              <p className="text-slate-500 mb-6">
                Registration fees for this edition will be published shortly.
              </p>
              <Button to="/contact" size="lg" variant="outline">Contact Us</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-14">

              {/* Fee table */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarClock size={16} style={{ color: 'var(--brand-dark)' }} />
                    Register early to secure the lowest rate.
                  </div>
                  <Select
                    value={selectedTier}
                    onChange={setSelectedTier}
                    className="w-full sm:w-[18rem]"
                    options={[
                      { value: 'all', label: 'All tiers' },
                      ...orderedTiers.map((t) => {
                        const s = deadlineState(t.endDate || t.deadline);
                        const name = t.label || TIER_LABELS[t.name] || t.name;
                        return {
                          value: t.name,
                          label: `${name}${t.isActive ? ' - Open' : ''}${s ? ` (${s.text})` : ''}`,
                        };
                      }),
                    ]}
                  />
                </div>

                {/* Wide table scrolls in its own container */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <div style={{ minWidth: 560 }}>
                    {/* Column heads */}
                    <div
                      className="grid border-b border-slate-200"
                      style={{ gridTemplateColumns: gridCols }}
                    >
                      <div className="px-5 py-6 flex items-end bg-slate-50">
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          Category
                        </span>
                      </div>
                      {visibleTiers.map((tier, i) => (
                        <div key={tier._id} className="border-l border-slate-200">
                          <TierHead
                            tier={tier}
                            index={i}
                            prevEnd={i > 0 ? (visibleTiers[i - 1].endDate || visibleTiers[i - 1].deadline) : null}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Fee rows */}
                    {categories.map((cat, rowIdx) => (
                      <div
                        key={cat}
                        className="reg-rise grid items-stretch"
                        style={{
                          gridTemplateColumns: gridCols,
                          animationDelay: `${0.25 + rowIdx * 0.04}s`,
                          borderBottom: rowIdx < categories.length - 1 ? '1px solid #f1f5f9' : 'none',
                        }}
                      >
                        <div className="px-5 py-4 flex items-baseline gap-3">
                          <span className="text-[11px] font-semibold text-slate-300 shrink-0 tabular-nums">
                            {String(rowIdx + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[15px] text-slate-700 leading-snug">
                            {categoryLabel(cat)}
                          </span>
                        </div>

                        {visibleTiers.map((tier) => {
                          const amount = tier.prices?.[cat];
                          const live = tier.isActive;
                          return (
                            <div
                              key={tier._id}
                              className="reg-col border-l border-slate-100 px-5 py-4 flex items-baseline justify-end"
                              style={{
                                background: live ? 'color-mix(in srgb, var(--brand) 5%, transparent)' : 'transparent',
                              }}
                            >
                              {amount ? (
                                <span
                                  className="reg-figure font-black"
                                  style={{
                                    fontSize: live ? '1.15rem' : '1rem',
                                    color: live ? '#0f172a' : '#94a3b8',
                                  }}
                                >
                                  {money(amount)}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-sm">-</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {/* Foot */}
                    <div
                      className="grid border-t border-slate-200 bg-slate-50"
                      style={{ gridTemplateColumns: gridCols }}
                    >
                      <div className="px-5 py-4 flex items-center">
                        <span className="text-xs italic text-slate-400">All prices in USD</span>
                      </div>
                      {visibleTiers.map((tier) => (
                        <div key={tier._id} className="border-l border-slate-100 px-5 py-4 flex justify-end">
                          {tier.isActive && (
                            <Button to="/registration" size="sm">
                              Register <ArrowRight size={14} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Deadlines */}
              {registrationDates.length > 0 && (
                <div>
                  <h2 className="text-lg font-black text-slate-900 mb-4">Registration Deadlines</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {registrationDates.map((d) => (
                      <div
                        key={d._id}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{d.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{formatDeadline(d.date)}</p>
                        </div>
                        <DeadlineBadge date={d.date} compact />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Includes */}
              <div className="rounded-2xl border border-slate-200 p-6 sm:p-9">
                <h2 className="text-2xl font-black text-slate-900 mb-7">Registration Includes</h2>
                <div className="grid md:grid-cols-2 gap-9">
                  {[
                    { title: 'For In-Person Participants', items: INCLUDES_INPERSON, note: true },
                    { title: 'For Virtual Participants', items: INCLUDES_VIRTUAL, note: false },
                  ].map((col) => (
                    <div key={col.title}>
                      <h3 className="text-base font-black text-slate-900 mb-4">{col.title}</h3>
                      <ul className="flex flex-col gap-2.5">
                        {col.items.map((t) => (
                          <li key={t} className="flex gap-2.5 text-[15px] text-slate-600 leading-relaxed">
                            <Check size={15} className="shrink-0 mt-1" style={{ color: 'var(--brand-dark)' }} />
                            {t}
                          </li>
                        ))}
                      </ul>
                      {col.note && (
                        <p className="text-sm italic text-slate-500 mt-5 leading-relaxed">
                          Note: Participants registered under Listener and Accompanying categories are
                          not allowed to present their papers in Oral or Poster sessions.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div
                className="rounded-2xl p-6 sm:p-8 border flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
              >
                <div>
                  <h3 className="text-lg font-black text-slate-900">Not sure which category fits?</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    Contact us and we'll help you pick the right registration category.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap shrink-0">
                  <Button to="/contact" variant="outline">Ask a Question</Button>
                  <Button to="/registration">Register Now <ArrowRight size={15} /></Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
