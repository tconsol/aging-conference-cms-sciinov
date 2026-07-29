import { useEffect, useState } from 'react';
import {
  Users, Award, Globe, BookOpen, Target, Heart, ArrowRight, CheckCircle,
  Microscope, Stethoscope, GraduationCap, Briefcase, Landmark, Sparkles,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';
import { usecongress } from '../context/congressContext';

const VALUES = [
  { icon: Target,   title: 'Scientific Excellence', desc: 'Rigorous peer-reviewed research and evidence-based discussions.' },
  { icon: Globe,    title: 'Global Collaboration',  desc: 'Fostering international partnerships across research institutions.' },
  { icon: Heart,    title: 'Patient Impact',         desc: 'Translating research insights into real-world health benefits.' },
  { icon: BookOpen, title: 'Knowledge Exchange',     desc: 'Open sharing of findings to accelerate discovery.' },
  { icon: Users,    title: 'Inclusive Community',    desc: 'Welcoming researchers at all career stages.' },
  { icon: Award,    title: 'Innovation',             desc: 'Championing novel approaches to aging research.' },
];

const WHY_ATTEND = [
  'Access to cutting-edge, peer-reviewed research in geroscience and aging biology',
  'Keynotes and panels from world-leading researchers and clinicians',
  'Dedicated networking sessions with global peers and collaborators',
  'Opportunities to present your own research through oral and poster sessions',
  'Certificate of participation and continuing education credit',
  'Exposure to the latest tools, technologies, and funding opportunities in the field',
];

const AUDIENCE = [
  { icon: Microscope,    title: 'Researchers & Scientists',       desc: 'Molecular biologists, geroscientists, and academic researchers.' },
  { icon: Stethoscope,   title: 'Clinicians & Geriatricians',     desc: 'Physicians and healthcare providers specializing in aging and elderly care.' },
  { icon: GraduationCap, title: 'Students & Early-Career',        desc: 'PhD candidates and postdocs building a career in aging research.' },
  { icon: Briefcase,     title: 'Industry & Pharma',              desc: 'R&D teams working on longevity and age-related therapeutics.' },
  { icon: Landmark,      title: 'Policy Makers',                  desc: 'Public health leaders shaping aging-related policy and care systems.' },
];

const STATS = [
  { num: '15+',   label: 'Years Running' },
  { num: '45+',   label: 'Countries' },
  { num: '1,200+',label: 'Annual Attendees' },
  { num: '500+',  label: 'Papers Presented' },
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
        title="About the congress"
        subtitle="Learn about our mission, history, and the scientific community driving aging research forward."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'About' }]}
      />

      {/* ── MISSION ── */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-12 items-start">

              {/* Left — content */}
              <div className="lg:col-span-3">
                <SectionHeader
                  label="Our Mission"
                  title={page?.title || 'Advancing Aging Science Globally'}
                  subtitle={page?.subtitle || 'The Aging Congress is dedicated to accelerating scientific discovery in geroscience, bringing together the brightest minds to tackle the fundamental questions of human aging.'}
                  centered={false}
                />
                {page?.content ? (
                  <div className="prose prose-slate max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: page.content }} />
                ) : (
                  <div className="space-y-4 text-slate-600 text-[15px] leading-relaxed">
                    <p>
                      Founded to address the growing need for a dedicated international forum on aging
                      research, our congress has grown into one of the most prestigious gatherings in
                      geroscience. We unite researchers from diverse disciplines — molecular biology,
                      clinical medicine, epidemiology, and translational science — to foster
                      collaboration and drive breakthroughs.
                    </p>
                    <p>
                      Each year, we curate a program that reflects the most pressing questions in aging
                      research, from cellular senescence and inflammation to lifestyle interventions and
                      age-related disease prevention.
                    </p>
                  </div>
                )}
                <div className="mt-8">
                  <Button to="/sessions" size="lg">Explore Sessions <ArrowRight size={16} /></Button>
                </div>
              </div>

              {/* Right — stats */}
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {STATS.map(({ num, label }) => (
                  <div
                    key={label}
                    className="relative rounded-2xl p-6 text-center overflow-hidden group"
                    style={{ background: 'var(--brand-light)', border: '1px solid color-mix(in srgb, var(--brand) 15%, transparent)' }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)' }}
                    />
                    <div className="relative z-10">
                      <div
                        className="text-3xl font-black mb-1 transition-colors duration-300 group-hover:text-white"
                        style={{ color: 'var(--brand-dark)' }}
                      >{num}</div>
                      <div className="text-sm font-medium text-slate-600 transition-colors duration-300 group-hover:text-white/80">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY ATTEND + AUDIENCE ── */}
      <section className="section-padding" style={{ background: '#f8fafc' }}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Why Attend */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
                  <Sparkles size={18} style={{ color: 'var(--brand-dark)' }} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--brand)' }}>Why Attend</p>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">What You'll Gain</h2>
                </div>
              </div>
              <ul className="flex flex-col gap-3">
                {WHY_ATTEND.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--brand)' }} />
                    <span className="text-sm text-slate-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 pt-5 border-t border-slate-100">
                <Button to="/registration" size="lg">Register Now <ArrowRight size={16} /></Button>
              </div>
            </div>

            {/* Who Should Attend */}
            <div
              className="rounded-3xl p-8 border"
              style={{ background: 'linear-gradient(145deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 75%, black) 100%)', borderColor: 'transparent' }}
            >
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Who Should Attend</p>
                <h2 className="text-xl font-black text-white leading-tight">Built for the Whole Community</h2>
              </div>
              <div className="flex flex-col gap-4">
                {AUDIENCE.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{title}</h4>
                      <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader
            label="Our Values"
            title="What We Stand For"
            subtitle="The principles that guide everything we do at the Aging Congress."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group relative rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 bg-white overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(90deg, var(--brand), var(--brand-dark))' }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--brand-light)' }}
                >
                  <Icon size={20} style={{ color: 'var(--brand-dark)' }} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {activeEdition && (
        <section className="section-padding" style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 80%, black) 100%)' }}>
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Join Us</p>
                <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
                  Ready to Be Part of It?
                </h2>
                <p className="text-lg text-white/70 leading-relaxed">
                  Secure your place at the world's leading congress on aging science and geroscience research.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button to="/registration" size="xl" variant="white">
                  Register Now <ArrowRight size={18} />
                </Button>
                <Button
                  to="/abstract-submission"
                  size="xl"
                  className="border-2 border-white/30 text-white hover:bg-white/10 bg-transparent rounded-lg px-8 py-4 text-base font-semibold transition-all"
                >
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
