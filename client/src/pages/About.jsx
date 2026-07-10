import { useEffect, useState } from 'react';
import {
  Users, Award, Globe, BookOpen, Target, Heart, ArrowRight, CheckCircle,
  Microscope, Stethoscope, GraduationCap, Briefcase, Landmark,
} from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';
import { usecongress } from '../context/congressContext';

const VALUES = [
  { icon: Target, title: 'Scientific Excellence', desc: 'Rigorous peer-reviewed research and evidence-based discussions.' },
  { icon: Globe, title: 'Global Collaboration', desc: 'Fostering international partnerships across research institutions.' },
  { icon: Heart, title: 'Patient Impact', desc: 'Translating research insights into real-world health benefits.' },
  { icon: BookOpen, title: 'Knowledge Exchange', desc: 'Open sharing of findings to accelerate discovery.' },
  { icon: Users, title: 'Inclusive Community', desc: 'Welcoming researchers at all career stages.' },
  { icon: Award, title: 'Innovation', desc: 'Championing novel approaches to aging research.' },
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
  { icon: Microscope, title: 'Researchers & Scientists', desc: 'Molecular biologists, geroscientists, and academic researchers.' },
  { icon: Stethoscope, title: 'Clinicians & Geriatricians', desc: 'Physicians and healthcare providers specializing in aging and elderly care.' },
  { icon: GraduationCap, title: 'Students & Early-Career Researchers', desc: 'PhD candidates and postdocs building a career in aging research.' },
  { icon: Briefcase, title: 'Industry & Pharma Professionals', desc: 'R&D teams working on longevity and age-related therapeutics.' },
  { icon: Landmark, title: 'Policy Makers & Administrators', desc: 'Public health leaders shaping aging-related policy and care systems.' },
];

export default function About() {
  const { activeEdition } = usecongress();
  const [page, setPage] = useState(null);
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

      {/* Mission section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <SectionHeader
                  label="Our Mission"
                  title={page?.title || 'Advancing Aging Science Globally'}
                  subtitle={page?.subtitle || 'The Aging congress is dedicated to accelerating scientific discovery in geroscience, bringing together the brightest minds to tackle the fundamental questions of human aging.'}
                  centered={false}
                />
                {page?.content ? (
                  <div
                    className="prose prose-slate max-w-none text-slate-600"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                  />
                ) : (
                  <div className="space-y-4 text-slate-600">
                    <p>
                      Founded to address the growing need for a dedicated international forum on aging
                      research, our congress has grown into one of the most prestigious gatherings in
                      geroscience. We unite researchers from diverse disciplines molecular biology,
                      clinical medicine, epidemiology, and translational science to foster
                      collaboration and drive breakthroughs.
                    </p>
                    <p>
                      Each year, we curate a program that reflects the most pressing questions in aging
                      research, from cellular senescence and inflammation to lifestyle interventions and
                      age-related disease prevention.
                    </p>
                  </div>
                )}
                <div className="mt-6">
                  <Button to="/sessions" size="lg">Explore Sessions</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '15+', label: 'Years Running' },
                  { num: '45+', label: 'Countries Represented' },
                  { num: '1,200+', label: 'Annual Attendees' },
                  { num: '500+', label: 'Research Papers Presented' },
                ].map(({ num, label }) => (
                  <div key={label} className="bg-teal-50 rounded-lg p-6 text-center border border-teal-100">
                    <div className="text-3xl font-bold text-teal-700 mb-1">{num}</div>
                    <div className="text-sm text-slate-600 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Attend */}
      <section className="section-padding bg-white border-t border-slate-100">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                label="Why Attend"
                title="What You'll Gain"
                subtitle="Here's what makes the Aging congress worth your time."
                centered={false}
              />
              <ul className="flex flex-col gap-3">
                {WHY_ATTEND.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle size={18} className="text-teal-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button to="/registration" size="lg">Register Now</Button>
              </div>
            </div>
            <div className="bg-teal-50 rounded-lg border border-teal-100 p-8">
              <SectionHeader
                label="Who Should Attend"
                title="Built for the Whole Community"
                subtitle=""
                centered={false}
              />
              <div className="flex flex-col gap-5">
                {AUDIENCE.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                      <Icon size={18} className="text-teal-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                      <p className="text-sm text-slate-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <SectionHeader
            label="Our Values"
            title="What We Stand For"
            subtitle="The principles that guide everything we do at the Aging congress."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-lg p-6 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={22} className="text-teal-700" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active edition */}
      {activeEdition && (
        <section className="section-padding bg-teal-700">
          <div className="container-custom text-center">
            <SectionHeader
              label="Current Edition"
              title={activeEdition.name || `${activeEdition.year} congress`}
              subtitle={activeEdition.description || 'Join us for another landmark year in aging research.'}
              light
              centered
            />
            <div className="flex flex-wrap justify-center gap-4">
              <Button to="/registration" size="xl" variant="white">Register Now</Button>
              <Button to="/program" size="xl"
                className="border-white/40 text-white hover:bg-white/10 bg-transparent border-2 rounded-lg">
                View Program
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="section-padding bg-teal-700">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-label !text-teal-200 !border-teal-400">
                Join Us
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-5">
                Ready to Be Part of It?
              </h2>
              <p className="text-xl text-teal-100 max-w-lg leading-relaxed">
                Secure your place at the world's leading congress on aging science and geroscience research.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:items-start">
              <Button to="/registration" size="xl" variant="white">
                Register Now <ArrowRight size={18} />
              </Button>
              <Button
                to="/abstract-submission"
                size="xl"
                className="border-2 border-white/40 text-white hover:bg-white/10 bg-transparent rounded-lg px-10 py-4 text-lg font-semibold transition-all duration-200"
              >
                Submit Abstract
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
