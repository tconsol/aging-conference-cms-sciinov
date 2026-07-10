import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { contentAPI } from '../api/content';

export default function Brochure() {
  const [brochure, setBrochure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentAPI.getBrochure()
      .then((res) => setBrochure(res.data?.data ?? res.data ?? null))
      .catch(() => setBrochure(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHero
        title="Brochure Download"
        subtitle="Download the official congress brochure for full program and participation details."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Brochure Download' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : !brochure ? (
            <div className="text-center py-20">
              <SectionHeader title="Brochure Coming Soon" subtitle="The congress brochure will be available for download shortly." />
            </div>
          ) : (
            <div className="max-w-lg mx-auto text-center bg-teal-50 border border-teal-100 rounded-lg p-10">
              <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-5">
                <FileText size={28} className="text-teal-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">{brochure.title}</h3>
              {brochure.edition?.title && (
                <p className="text-sm text-teal-600 font-medium mb-6">
                  {brochure.edition.title} ({brochure.edition.year})
                </p>
              )}
              <Button href={brochure.fileUrl} size="lg" download>
                <Download size={16} /> Download Brochure
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
