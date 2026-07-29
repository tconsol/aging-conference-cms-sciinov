import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
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
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Photo / Avatar */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-teal-500 to-emerald-600">
        {member.photo ? (
          <>
            <img
              src={member.photo}
              alt={member.fullName}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl font-bold text-white/90 select-none">{initials}</span>
          </div>
        )}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight size={14} className="text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors text-sm leading-snug line-clamp-1">
          {member.fullName || 'Committee Member'}
        </h3>
        {member.designation && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{member.designation}</p>
        )}
        {member.organization && (
          <p className="text-xs font-semibold text-teal-600 mt-2 line-clamp-1">{member.organization}</p>
        )}
        {member.country && (
          <div className="flex items-center gap-1 mt-2">
            <MapPin size={11} className="text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400">{member.country}</span>
          </div>
        )}
      </div>

      {/* Bottom accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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
              <SectionHeader title="Committee Forthcoming" subtitle="Committee members will be announced prior to the congress." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
