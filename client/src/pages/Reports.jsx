import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, ArrowRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';
import { formatDateShort } from '../utils/helpers';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentAPI.getReports()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setReports(Array.isArray(data) ? data : []);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHero
        title="Congress Reports"
        subtitle="Access proceedings, reports, and publications from past Aging Congress editions."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Reports Coming Soon" subtitle="Congress reports and proceedings will be available here after the event." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Cover image — fixed height so all cards align */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden shrink-0" style={{ background: 'var(--brand-light)' }}>
                    {report.coverImage ? (
                      <img
                        src={report.coverImage}
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={40} style={{ color: 'var(--brand)' }} className="opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Body — flex-1 keeps footer pinned to bottom */}
                  <div className="p-6 flex flex-col flex-1">
                    {report.createdAt && (
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
                        {formatDateShort(report.createdAt)}
                      </p>
                    )}

                    <h3 className="font-black text-slate-900 leading-snug mb-2 line-clamp-2">
                      {report.title}
                    </h3>

                    {report.description && (
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 flex-1">
                        {report.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 gap-2 flex-wrap">
                      {/* Read More → detail page */}
                      <Link
                        to={`/reports/${report._id}`}
                        className="flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70"
                        style={{ color: 'var(--brand-dark)' }}
                      >
                        Read More <ArrowRight size={13} />
                      </Link>

                      {/* Download / external */}
                      {report.fileUrl ? (
                        <a
                          href={report.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all hover:opacity-80"
                          style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)' }}
                        >
                          <Download size={12} /> Download
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
