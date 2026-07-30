import { useEffect, useState } from 'react';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';

const TYPE_LABELS = {
  template: 'Templates',
  flyer: 'Flyers',
  pdf: 'PDFs',
  brochure: 'Brochures',
  other: 'General',
};

function FileIcon({ type }) {
  if (type === 'flyer') return <ImageIcon size={20} style={{ color: 'var(--brand-dark)' }} />;
  return <FileText size={20} style={{ color: 'var(--brand-dark)' }} />;
}

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentAPI.getDownloads()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setDownloads(Array.isArray(data) ? data : []);
      })
      .catch(() => setDownloads([]))
      .finally(() => setLoading(false));
  }, []);

  // Group by type
  const groups = downloads.reduce((acc, d) => {
    const label = TYPE_LABELS[d.type] || 'General';
    if (!acc[label]) acc[label] = [];
    acc[label].push(d);
    return acc;
  }, {});

  return (
    <div>
      <PageHero
        title="Downloads"
        subtitle="Access brochures, presentations, forms, and other congress resources."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Downloads' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-20">
              <SectionHeader title="Downloads Coming Soon" subtitle="Downloadable resources will be available here shortly." />
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {Object.entries(groups).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{category}</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <a
                        key={item._id}
                        href={item.fileUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--brand-light)' }}>
                            <FileIcon type={item.type} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-900 truncate group-hover:text-slate-600 transition-colors">
                            {item.title}
                          </p>
                        </div>
                        <Download size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors shrink-0" />
                      </a>
                    ))}
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
