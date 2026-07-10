import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { peopleAPI } from '../api/people';

function MemberCard({ member }) {
  const initials = member.fullName
    ? member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'M';

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all overflow-hidden flex flex-col">
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.fullName}
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div className="w-full aspect-square bg-teal-50 flex items-center justify-center">
          <span className="text-4xl font-bold text-teal-700">{initials}</span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base leading-snug">
          {member.fullName || 'Committee Member'}
        </h3>
        {member.designation && (
          <p className="text-sm text-slate-500 mt-0.5">{member.designation}</p>
        )}
        {member.organization && (
          <p className="text-sm text-teal-600 font-medium mt-0.5">{member.organization}</p>
        )}
        {member.country && (
          <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <MapPin size={12} className="shrink-0" /> {member.country}
          </p>
        )}

        <div className="mt-auto pt-4">
          <Button to={`/committee/${member._id}`} variant="secondary" size="sm" className="w-full justify-center">
            View Profile
          </Button>
        </div>
      </div>
    </div>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
