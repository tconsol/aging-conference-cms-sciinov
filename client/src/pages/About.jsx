import { useEffect, useState, useRef } from 'react';
import {
  Users, Award, Globe, BookOpen, Target, Heart, ArrowRight, CheckCircle,
  Microscope, Stethoscope, GraduationCap, Briefcase, Landmark,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';
import { usecongress } from '../context/congressContext';

/* ── Scroll-reveal count-up ─────────────────────────────────────────── */
function StatNumber({ value }) {
  const num    = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = value.replace(/^[0-9,]+/, '');
  const [count, setCount] = useState(0);
  const [on, setOn]       = useState(false);
  const ref               = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!on) return;
    let t0 = null;
    const dur = 1600;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [on, num]);
  return <span ref={ref}>{num >= 1000 ? count.toLocaleString() : count}{suffix}</span>;
}

const VALUES = [
  { icon: Target,   label: '01', title: 'Scientific Excellence', desc: 'Rigorous peer-reviewed research and evidence-based discussions at every session.' },
  { icon: Globe,    label: '02', title: 'Global Collaboration',  desc: 'Fostering international partnerships across research institutions worldwide.' },
  { icon: Heart,    label: '03', title: 'Patient Impact',        desc: 'Translating research insights into real-world health benefits.' },
  { icon: BookOpen, label: '04', title: 'Knowledge Exchange',    desc: 'Open sharing of findings to accelerate discovery across disciplines.' },
  { icon: Users,    label: '05', title: 'Inclusive Community',   desc: 'Welcoming researchers, clinicians, and students at all career stages.' },
  { icon: Award,    label: '06', title: 'Innovation First',      desc: 'Championing novel approaches and emerging technologies in aging science.' },
];

const WHY_ATTEND = [
  'Cutting-edge, peer-reviewed research in geroscience and aging biology',
  'Keynotes from world-leading researchers and Nobel laureates',
  'Networking with global peers and collaborators across disciplines',
  'Present your own research through oral and poster sessions',
  'Certificate of participation and continuing education credit',
  'Exposure to latest tools, technologies, and funding opportunities',
];

const AUDIENCE = [
  { icon: Microscope,    title: 'Researchers & Scientists',  desc: 'Molecular biologists, geroscientists, academic researchers.' },
  { icon: Stethoscope,   title: 'Clinicians & Geriatricians',desc: 'Physicians and healthcare providers in aging and elderly care.' },
  { icon: GraduationCap, title: 'Students & Early-Career',   desc: 'PhD candidates and postdocs building a career in aging research.' },
  { icon: Briefcase,     title: 'Industry & Pharma',         desc: 'R&D teams working on longevity and age-related therapeutics.' },
  { icon: Landmark,      title: 'Policy Makers',             desc: 'Public health leaders shaping aging-related policy and care systems.' },
];

const STATS = [
  { value: '15+',    label: 'Years of Excellence' },
  { value: '45+',    label: 'Countries Represented' },
  { value: '1,200+', label: 'Annual Attendees' },
  { value: '500+',   label: 'Research Papers' },
];

export default function About() {
  const { activeEdition } = usecongress();
  const [page, setPage]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentAPI.getPage('about')
      .then((res) => setPage(res.data?.data ?? res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHero
        title="About the Congress"
        subtitle="Learn about our mission, history, and the scientific community driving aging research forward."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      {/* ── MISSION ─────────────────────────────────────────────────── */}
      <section className="bg-white section-padding">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              {/* Top label */}
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--brand)' }}>
                Our Mission
              </p>

              {/* Two-column: headline left, body right */}
              <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.08] tracking-tight" style={{ textWrap: 'balance' }}>
                  {page?.title || 'Advancing Aging Science for Humanity'}
                </h2>
                <div className="pt-2">
                  <p className="text-lg text-slate-600 leading-relaxed mb-6">
                    {page?.subtitle || 'The Aging Congress is dedicated to accelerating scientific discovery in geroscience, bringing together the brightest minds to tackle the fundamental questions of human aging.'}
                  </p>
                  {page?.content ? (
                    <div className="prose prose-slate max-w-none text-slate-600 text-base" dangerouslySetInnerHTML={{ __html: page.content }} />
                  ) : (
                    <p className="text-slate-500 leading-relaxed">
                      Founded to address the growing need for a dedicated international forum on aging
                      research, our congress has grown into one of the most prestigious gatherings in
                      geroscience — uniting researchers from molecular biology, clinical medicine,
                      epidemiology, and translational science to drive breakthroughs.
                    </p>
                  )}
                  <div className="mt-8">
                    <Button to="/sessions" size="lg">Explore Sessions <ArrowRight size={16} /></Button>
                  </div>
                </div>
              </div>

              {/* Stats row — large typographic numbers */}
              <div
                className="grid grid-cols-2 lg:grid-cols-4 rounded-3xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 80%, black) 100%)' }}
              >
                {STATS.map(({ value, label }, i) => (
                  <div
                    key={label}
                    className="text-center px-6 py-10 relative"
                    style={{ borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
                  >
                    <div className="text-4xl lg:text-5xl font-black text-white mb-2 tabular-nums">
                      <StatNumber value={value} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────── */}
      <section className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: 'var(--brand)' }}>What We Stand For</p>
              <h2 className="text-3xl font-black text-slate-900">Our Values</h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: '#e2e8f0', borderRadius: 20, overflow: 'hidden' }}>
            {VALUES.map(({ icon: Icon, label, title, desc }) => (
              <div
                key={title}
                className="group bg-white hover:bg-slate-900 transition-colors duration-300 p-7 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-300"
                    style={{ background: 'var(--brand-light)' }}
                  >
                    <Icon size={20} style={{ color: 'var(--brand-dark)' }} className="group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-200 group-hover:text-slate-600 transition-colors duration-300 mt-1">
                    {label}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-slate-900 group-hover:text-white transition-colors duration-300 mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ATTEND + AUDIENCE ────────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Why Attend */}
            <div className="rounded-3xl border border-slate-100 p-8 lg:p-10 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--brand)' }}>Benefits</p>
              <h2 className="text-2xl font-black text-slate-900 mb-7">Why You Should Attend</h2>
              <ul className="space-y-4">
                {WHY_ATTEND.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'var(--brand-light)' }}
                    >
                      <CheckCircle size={13} style={{ color: 'var(--brand-dark)' }} />
                    </span>
                    <span className="text-[15px] text-slate-600 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-9 pt-7 border-t border-slate-100">
                <Button to="/registration" size="lg">Register Now <ArrowRight size={16} /></Button>
              </div>
            </div>

            {/* Who Should Attend */}
            <div
              className="rounded-3xl p-8 lg:p-10"
              style={{ background: 'linear-gradient(150deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)' }}
            >
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-3 text-white/40">Audience</p>
              <h2 className="text-2xl font-black text-white mb-7">Built for the Whole Community</h2>
              <div className="space-y-5">
                {AUDIENCE.map(({ icon: Icon, title, desc }, i) => (
                  <div key={title} className="flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Icon size={15} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight">{title}</h4>
                      <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      {activeEdition && (
        <section className="section-padding" style={{ background: '#f8fafc' }}>
          <div className="container-custom">
            <div
              className="rounded-3xl p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-8"
              style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 75%, black) 100%)' }}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-white/40 mb-3">Join Us</p>
                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                  Ready to Be Part of It?
                </h2>
                <p className="text-white/60 mt-3 max-w-md leading-relaxed">
                  Secure your place at the world's leading congress on aging science and geroscience research.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Button to="/registration" size="xl" variant="white">Register Now <ArrowRight size={18} /></Button>
                <Button to="/abstract-submission" size="xl"
                  className="border-2 border-white/25 text-white hover:bg-white/10 bg-transparent rounded-xl px-7 py-3.5 text-base font-bold transition-all">
                  Submit Abstract
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
