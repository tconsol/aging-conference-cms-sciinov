import { useEffect, useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
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
        title="congress Reports"
        subtitle="Access proceedings, reports, and publications from past Aging congress editions."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Reports' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : reports.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Reports Coming Soon" subtitle="congress reports and proceedings will be available here after the event." />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <div
                  key={report._id}
                  className="bg-white rounded-lg border border-slate-100 shadow-sm p-6 hover:shadow-md hover:border-teal-100 transition-all flex flex-col"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText size={22} className="text-teal-700" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{report.title}</h3>
                  {report.edition && (
                    <p className="text-xs text-teal-600 font-medium mb-2">{report.edition?.name ?? report.edition}</p>
                  )}
                  {report.description && (
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed flex-1">{report.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    {report.publishedAt && (
                      <span className="text-xs text-slate-400">{formatDateShort(report.publishedAt)}</span>
                    )}
                    {report.fileUrl ? (
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors"
                      >
                        <Download size={14} /> Download
                      </a>
                    ) : report.url ? (
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 transition-colors"
                      >
                        <ExternalLink size={14} /> View
                      </a>
                    ) : null}
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
