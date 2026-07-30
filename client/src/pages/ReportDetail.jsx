import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Calendar, FileText } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { contentAPI } from '../api/content';
import { formatDate } from '../utils/helpers';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    contentAPI.getReportById(id)
      .then((res) => setReport(res.data?.data ?? res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
  }

  if (error || !report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
          <FileText size={28} style={{ color: 'var(--brand-dark)' }} />
        </div>
        <p className="text-slate-600 text-lg font-semibold">Report not found.</p>
        <Link to="/reports" className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--brand-dark)' }}>
          <ArrowLeft size={15} /> All Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb bar */}
      <div className="border-b border-slate-100">
        <div className="container-custom py-4">
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--brand-dark)' }}
          >
            <ArrowLeft size={15} /> All Reports
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div
        className="py-16"
        style={{
          background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 70%, black) 100%)',
        }}
      >
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-start gap-8 max-w-4xl">
            {/* Cover thumbnail */}
            <div
              className="w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-2xl"
              style={{ border: '3px solid rgba(255,255,255,0.12)' }}
            >
              {report.coverImage ? (
                <img src={report.coverImage} alt={report.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <FileText size={36} className="text-white/50" />
                </div>
              )}
            </div>

            {/* Title / meta */}
            <div className="pb-1">
              {report.createdAt && (
                <div className="flex items-center gap-1.5 text-white/50 text-xs font-semibold mb-3">
                  <Calendar size={12} />
                  {formatDate(report.createdAt)}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight" style={{ textWrap: 'balance' }}>
                {report.title}
              </h1>
              {report.edition && (
                <p className="text-white/50 mt-2 text-sm">
                  {typeof report.edition === 'object'
                    ? `${report.edition.title ?? ''} ${report.edition.year ?? ''}`.trim()
                    : report.edition}
                </p>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                {report.fileUrl && (
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ background: 'white', color: 'var(--brand-dark)' }}
                  >
                    <Download size={15} /> Download Report
                  </a>
                )}
                {report.url && (
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all hover:bg-white/10"
                    style={{ border: '1.5px solid rgba(255,255,255,0.25)', color: 'white' }}
                  >
                    <ExternalLink size={14} /> View Online
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-10 max-w-5xl">
            {/* Main content */}
            <div className="lg:col-span-2">
              {report.description ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--brand)' }}>
                    About This Report
                  </p>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-[15px]">
                    {typeof report.description === 'string' && report.description.startsWith('<') ? (
                      <div dangerouslySetInnerHTML={{ __html: report.description }} />
                    ) : (
                      <p>{report.description}</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-slate-400 italic">No additional information available for this report.</p>
              )}

              {/* Content / full body if available */}
              {report.content && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-xs font-black uppercase tracking-[0.25em] mb-4" style={{ color: 'var(--brand)' }}>
                    Full Content
                  </p>
                  <div
                    className="prose prose-slate max-w-none text-slate-600 text-[15px] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: report.content }}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Details card */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
              >
                <h3 className="font-black text-slate-900 text-sm mb-4">Report Details</h3>
                <div className="flex flex-col gap-3">
                  {report.createdAt && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Published</p>
                      <p className="text-sm font-semibold text-slate-700">{formatDate(report.createdAt)}</p>
                    </div>
                  )}
                  {report.type && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Type</p>
                      <p className="text-sm font-semibold text-slate-700 capitalize">{report.type}</p>
                    </div>
                  )}
                  {report.edition && typeof report.edition === 'object' && report.edition.year && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Edition</p>
                      <p className="text-sm font-semibold text-slate-700">{report.edition.year} — {report.edition.city ?? ''}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Download CTA */}
              {(report.fileUrl || report.url) && (
                <div className="rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-3">
                  <h3 className="font-black text-slate-900 text-sm">Access Report</h3>
                  {report.fileUrl && (
                    <a
                      href={report.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 text-white"
                      style={{ background: 'var(--brand-dark)' }}
                    >
                      <Download size={15} /> Download PDF
                    </a>
                  )}
                  {report.url && (
                    <a
                      href={report.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all border hover:shadow-md"
                      style={{ borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)', color: 'var(--brand-dark)' }}
                    >
                      <ExternalLink size={14} /> View Online
                    </a>
                  )}
                </div>
              )}

              {/* Back link */}
              <Button to="/reports" variant="outline" size="sm">
                <ArrowLeft size={14} /> All Reports
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
