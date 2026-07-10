import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Building } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

function OtherMemberCard({ member }) {
  const initials = member.fullName
    ? member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'M';

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all overflow-hidden flex flex-col">
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.fullName}
          className="w-full h-44 object-cover"
        />
      ) : (
        <div className="w-full h-44 bg-teal-50 flex items-center justify-center">
          <span className="text-3xl font-bold text-teal-700">{initials}</span>
        </div>
      )}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-sm leading-snug">
          {member.fullName || 'Committee Member'}
        </h3>
        {member.designation && (
          <p className="text-xs text-slate-500 mt-0.5">{member.designation}</p>
        )}
        {member.organization && (
          <p className="text-xs text-teal-600 font-medium mt-0.5">{member.organization}</p>
        )}
        <div className="mt-auto pt-3">
          <Button to={`/committee/${member._id}`} variant="secondary" size="sm" className="w-full justify-center">
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CommitteeDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-slate-600 text-lg">Committee member not found.</p>
        <Link to="/committee" className="text-teal-700 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Committee
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero
        title={member.fullName}
        subtitle={[member.designation, member.organization].filter(Boolean).join(' · ')}
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Committee', href: '/committee' },
          { label: member.fullName },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.fullName}
                  className="w-full rounded-lg object-cover shadow-md aspect-[3/4]"
                />
              ) : (
                <div className="w-full rounded-lg bg-teal-100 flex items-center justify-center aspect-[3/4]">
                  <span className="text-6xl font-bold text-teal-300">{member.fullName?.[0] ?? 'M'}</span>
                </div>
              )}

              {/* Info card */}
              <div className="bg-slate-50 rounded-lg border border-slate-100 p-5 flex flex-col gap-3">
                {member.organization && (
                  <div className="flex items-start gap-2">
                    <Building size={16} className="text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{member.organization}</span>
                  </div>
                )}
                {member.country && (
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-teal-600 shrink-0" />
                    <span className="text-sm text-slate-700">{member.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2">
              {member.biography && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Biography</h2>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    {typeof member.biography === 'string' && member.biography.startsWith('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: member.biography }} />
                    ) : (
                      <p className="leading-relaxed">{member.biography}</p>
                    )}
                  </div>
                </div>
              )}

              <Link
                to="/committee"
                className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 font-medium text-sm transition-colors"
              >
                <ArrowLeft size={16} /> Back to All Committee Members
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More Committee Members */}
      {otherMembers.length > 0 && (
        <section className="section-padding bg-slate-50">
          <div className="container-custom">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <span className="section-label">Scientific Committee</span>
                <h2 className="text-2xl font-black text-slate-900">More Committee Members</h2>
              </div>
              <Button to="/committee" variant="secondary" size="sm" className="shrink-0">
                View All
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
