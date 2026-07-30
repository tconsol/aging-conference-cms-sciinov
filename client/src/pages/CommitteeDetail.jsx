import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

function OtherMemberCard({ member }) {
  const initials = member.fullName
    ? member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'M';

  return (
    <Link
      to={`/committee/${member._id}`}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      {member.photo ? (
        <img src={member.photo} alt={member.fullName} className="w-full h-40 object-cover object-top group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
          <span className="text-3xl font-black" style={{ color: 'var(--brand-dark)' }}>{initials}</span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1">
          {member.fullName || 'Committee Member'}
        </h3>
        {member.designation && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{member.designation}</p>}
        {member.organization && <p className="text-xs font-bold mt-0.5 line-clamp-1" style={{ color: 'var(--brand-dark)' }}>{member.organization}</p>}
      </div>
    </Link>
  );
}

export default function CommitteeDetail() {
  const { id } = useParams();
  const [member, setMember]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);
  const [otherMembers, setOtherMembers] = useState([]);

  useEffect(() => {
    peopleAPI.getCommitteeMember(id)
      .then((res) => setMember(res.data?.data ?? res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    peopleAPI.getCommittee()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        const list = (Array.isArray(data) ? data : [])
          .filter((m) => m._id !== id)
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .slice(0, 3);
        setOtherMembers(list);
      })
      .catch(() => setOtherMembers([]));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (error || !member) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-lg font-semibold">Committee member not found.</p>
        <Link to="/committee" className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-dark)' }}>
          <ArrowLeft size={16} /> Back to Committee
        </Link>
      </div>
    );
  }

  const initials = member.fullName
    ? member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'M';

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-slate-100">
        <div className="container-custom py-4">
          <Link to="/committee" className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-dark)' }}>
            <ArrowLeft size={15} /> Scientific Committee
          </Link>
        </div>
      </div>

      {/* Hero strip */}
      <div
        className="py-14"
        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)' }}
      >
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-8">
            <div
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden shrink-0 shadow-2xl"
              style={{ border: '4px solid rgba(255,255,255,0.15)' }}
            >
              {member.photo ? (
                <img src={member.photo} alt={member.fullName} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <span className="text-5xl font-black text-white/70 select-none">{initials}</span>
                </div>
              )}
            </div>
            <div className="pb-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{member.fullName}</h1>
              {member.designation && <p className="text-white/70 mt-1.5 text-lg font-medium">{member.designation}</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                {member.organization && (
                  <span className="flex items-center gap-2 text-white/60 text-sm">
                    <Building size={13} /> {member.organization}
                  </span>
                )}
                {member.country && (
                  <span className="flex items-center gap-2 text-white/60 text-sm">
                    <MapPin size={13} /> {member.country}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl">
            {member.biography ? (
              <>
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--brand)' }}>Biography</p>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-[15px]">
                  {typeof member.biography === 'string' && member.biography.startsWith('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: member.biography }} />
                  ) : (
                    <p>{member.biography}</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-slate-400 italic">No biography available.</p>
            )}
          </div>
        </div>
      </section>

      {/* Other members */}
      {otherMembers.length > 0 && (
        <section className="section-padding" style={{ background: '#f8fafc' }}>
          <div className="container-custom">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] mb-1" style={{ color: 'var(--brand)' }}>Scientific Committee</p>
                <h2 className="text-2xl font-black text-slate-900">More Members</h2>
              </div>
              <Button to="/committee" variant="outline" size="sm">View All</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {otherMembers.map((m) => (
                <OtherMemberCard key={m._id} member={m} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
