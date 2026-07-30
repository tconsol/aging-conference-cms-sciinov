import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Users2 } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

function MemberCard({ member }) {
  const initials = member.fullName
    ? member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'M';

  return (
    <Link
      to={`/committee/${member._id}`}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-transparent hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
    >
      {/* Photo */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '4/5', background: 'linear-gradient(150deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)' }}
      >
        {member.photo ? (
          <>
            <img
              src={member.photo}
              alt={member.fullName}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)' }} />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl font-black text-white/80 select-none tracking-tight">{initials}</span>
          </div>
        )}

        <div
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
        >
          <ArrowRight size={14} className="text-white" />
        </div>

        {member.country && (
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
            <span className="flex items-center gap-1 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}>
              <MapPin size={9} /> {member.country}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-slate-700 transition-colors">
          {member.fullName || 'Committee Member'}
        </h3>
        {member.designation && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{member.designation}</p>
        )}
        {member.organization && (
          <p className="text-xs font-bold mt-2 line-clamp-1" style={{ color: 'var(--brand-dark)' }}>
            {member.organization}
          </p>
        )}
      </div>

      <div
        className="h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: 'linear-gradient(90deg, var(--brand-dark), var(--brand))' }}
      />
    </Link>
  );
}

export default function Committee() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    peopleAPI.getCommittee()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setMembers(Array.isArray(data) ? data : []);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const sortedMembers = [...members].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <div>
      <PageHero
        title="Scientific Committee"
        subtitle="Distinguished scientists and experts guiding the congress's scientific program."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Committee' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : sortedMembers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--brand-light)' }}>
                <Users2 size={28} style={{ color: 'var(--brand-dark)' }} />
              </div>
              <SectionHeader title="Committee Forthcoming" subtitle="Committee members will be announced prior to the congress." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedMembers.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
