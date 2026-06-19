import { useEffect, useState } from 'react';
import { Download, FileText, Image, Film, Archive } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';
import { formatDateShort } from '../utils/helpers';

function FileIcon({ type }) {
  if (type?.includes('image')) return <Image size={20} className="text-teal-600" />;
  if (type?.includes('video')) return <Film size={20} className="text-teal-600" />;
  if (type?.includes('zip') || type?.includes('archive')) return <Archive size={20} className="text-teal-600" />;
  return <FileText size={20} className="text-teal-600" />;
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

  // Group by category
  const groups = downloads.reduce((acc, d) => {
    const cat = d.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(d);
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
                        href={item.fileUrl || item.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-md hover:border-teal-100 transition-all group"
                      >
                        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
                          <FileIcon type={item.fileType} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
                          )}
                          {item.fileSize && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.fileSize}</p>
                          )}
                        </div>
                        <Download size={16} className="text-slate-300 group-hover:text-teal-600 transition-colors shrink-0" />
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
