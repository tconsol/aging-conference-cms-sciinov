import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Globe, Building } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

export default function CommitteeDetail() {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    peopleAPI.getCommitteeMember(id)
      .then((res) => setMember(res.data?.data ?? res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
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
    </div>
  );
}
