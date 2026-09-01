import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MapPin, Calendar, ArrowLeft, Download, Users, Loader2,
  BookOpen, FileText, Images, ArrowRight,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { formatDate, getErrorMessage, downloadBlob } from '../utils/helpers';

const STATUS_CONFIG = {
  active:   { label: 'Active Edition', style: { background: 'var(--brand-light)', color: 'var(--brand-dark)', borderColor: 'color-mix(in srgb, var(--brand) 30%, transparent)' } },
  upcoming: { label: 'Upcoming',       style: { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' } },
  past:     { label: 'Past Edition',   style: { background: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' } },
};

// Wide horizontal download card cover on the left, action on the right.
// Laid out in a row so a single material doesn't strand half the width.
function MaterialCard({ material, type, editionId }) {
  const [downloading, setDownloading] = useState(false);
  if (!material?.fileUrl) return null;

  const Icon = type === 'book' ? BookOpen : FileText;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await congressAPI.downloadMaterial(editionId, type);
      downloadBlob(res.data, material.fileName || `${material.title || type}.pdf`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-3 hover:shadow-md hover:border-slate-200 transition-all">
      <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100">
        {material.coverImage ? (
          <img src={material.coverImage} alt={material.title} className="w-full h-full object-cover" />
        ) : (
          <Icon size={20} className="text-slate-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-900 text-sm leading-snug">{material.title}</p>
        {material.fileName && (
          <p className="text-xs text-slate-400 truncate mt-0.5">{material.fileName}</p>
        )}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg text-white transition-opacity disabled:opacity-60"
          style={{ background: 'var(--brand-dark)' }}
        >
          {downloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}
          {downloading ? 'Preparing…' : 'Download'}
        </button>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--brand-light)' }}
      >
        <Icon size={14} style={{ color: 'var(--brand-dark)' }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

export default function EditionDetail() {
  const { id } = useParams();
  const [edition, setEdition] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    setLoading(true);
    congressAPI.getOne(id)
      .then((res) => {
        const data = res.data?.data || null;
        setEdition(data);
        if (data?._id) {
          return congressAPI.getGallery(data._id)
            .then((g) => setGallery(g.data?.data || []))
            .catch(() => setGallery([]));
        }
      })
      .catch(() => setEdition(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowRight') setLightboxIdx((i) => (i + 1) % gallery.length);
      if (e.key === 'ArrowLeft') setLightboxIdx((i) => (i - 1 + gallery.length) % gallery.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIdx, gallery.length]);

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  }

  if (!edition) {
    return (
      <div className="text-center py-24 container-custom">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Edition not found</h2>
        <p className="text-slate-500 mb-6">This edition may have been removed.</p>
        <Button to="/editions?status=past" variant="primary" size="sm">
          <ArrowLeft size={14} /> Back to Past Events
        </Button>
      </div>
    );
  }

  const sc = STATUS_CONFIG[edition.status] || STATUS_CONFIG.past;
  const hasBook    = !!edition.conferenceBook?.fileUrl;
  const hasProgram = !!edition.conferenceProgram?.fileUrl;
  const hasMaterials = hasBook || hasProgram;
  const hasHighlights = edition.highlights?.length > 0;

  return (
    <div className="bg-slate-50/60">
      {/* ── Compact hero ── */}
      <div className="relative">
        <div className="h-52 sm:h-64 w-full overflow-hidden bg-slate-900">
          {edition.bannerImage ? (
            <img src={edition.bannerImage} alt={edition.title} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, color-mix(in srgb, var(--brand-dark) 60%, black) 100%)' }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
        </div>

        <div className="absolute inset-x-0 top-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
            <Link
              to="/editions?status=past"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} /> Back to Past Events
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-white/80">{edition.year}</span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full border" style={sc.style}>
                {sc.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight max-w-4xl">
              {edition.title}
            </h1>
            {edition.theme && (
              <p className="text-white/70 italic mt-1.5 text-sm max-w-3xl">{edition.theme}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Facts bar fills the width instead of stranding a sidebar ── */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Fact
            icon={Calendar}
            label="Dates"
            value={`${formatDate(edition.startDate)} – ${formatDate(edition.endDate)}`}
          />
          <Fact
            icon={MapPin}
            label="Location"
            value={[edition.city, edition.country].filter(Boolean).join(', ') || ''}
          />
          <Fact icon={Images} label="Photos" value={gallery.length ? `${gallery.length} in gallery` : 'None yet'} />
          <div className="flex items-center gap-2 justify-start md:justify-end col-span-2 md:col-span-1">
            <Button to={`/speakers?edition=${edition._id}`} size="sm" variant="secondary">
              <Users size={14} /> Speakers
            </Button>
            {edition.status !== 'past' && (
              <Button to="/registration" size="sm" variant="primary">
                Register <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* ── About + Highlights side by side so neither leaves a dead column ── */}
        {(edition.description || hasHighlights) && (
          <div className={`grid gap-6 ${edition.description && hasHighlights ? 'lg:grid-cols-3' : 'grid-cols-1'}`}>
            {edition.description && (
              <div className={`bg-white rounded-2xl border border-slate-100 p-6 ${hasHighlights ? 'lg:col-span-2' : ''}`}>
                <h2 className="text-base font-black text-slate-900 mb-3">About This Edition</h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[15px]">
                  {edition.description}
                </p>
              </div>
            )}

            {hasHighlights && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6">
                <h2 className="text-base font-black text-slate-900 mb-4">Highlights</h2>
                <div className={`grid gap-3 ${edition.description ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                  {edition.highlights.map((h, i) => (
                    <div key={i} className="text-center rounded-xl py-3 px-2" style={{ background: 'var(--brand-light)' }}>
                      <p className="font-black text-lg" style={{ color: 'var(--brand-dark)' }}>{h.value}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{h.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Downloads horizontal row ── */}
        {hasMaterials && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-base font-black text-slate-900 mb-4">Downloads</h2>
            <div className={`grid gap-4 ${hasBook && hasProgram ? 'sm:grid-cols-2' : 'sm:max-w-md'}`}>
              <MaterialCard material={edition.conferenceBook} type="book" editionId={edition._id} />
              <MaterialCard material={edition.conferenceProgram} type="program" editionId={edition._id} />
            </div>
          </div>
        )}

        {/* ── Gallery full width, denser grid ── */}
        {gallery.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Images size={16} style={{ color: 'var(--brand-dark)' }} />
              <h2 className="text-base font-black text-slate-900">Event Gallery</h2>
              <span className="text-xs text-slate-400 font-medium">({gallery.length})</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {gallery.map((img, i) => (
                <button
                  key={img._id}
                  onClick={() => setLightboxIdx(i)}
                  className="aspect-square rounded-lg overflow-hidden bg-slate-100 group"
                >
                  <img
                    src={img.imageUrl}
                    alt={img.caption || edition.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && gallery[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90"
          onClick={() => setLightboxIdx(null)}
        >
          <img
            src={gallery[lightboxIdx].imageUrl}
            alt={gallery[lightboxIdx].caption || edition.title}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
            {lightboxIdx + 1} / {gallery.length}
          </div>
        </div>
      )}
    </div>
  );
}
