import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Images, UploadCloud, Trash2, Loader2, X } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { galleryAPI } from '../../api/congress';
import { getErrorMessage } from '../../utils/helpers';

export default function EditionGalleryModal({ open, onClose, edition }) {
  const [images, setImages]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    if (!edition) return;
    setLoading(true);
    try {
      const res = await galleryAPI.getAll({ edition: edition._id });
      setImages(res.data.data || []);
    } catch {
      toast.error('Failed to load gallery images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) fetchImages(); }, [open, edition]); // eslint-disable-line react-hooks/exhaustive-deps

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('edition', edition._id);
      files.forEach((f) => fd.append('images', f));
      const res = await galleryAPI.create(fd);
      setImages((prev) => [...prev, ...(res.data.data || [])]);
      toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded.`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await galleryAPI.delete(deleteId);
      setImages((prev) => prev.filter((img) => img._id !== deleteId));
      toast.success('Image removed.');
      setDeleteId(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  if (!edition) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Gallery ${edition.title}`}
        size="xl"
        footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
      >
        {/* Upload dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            uploadFiles(e.dataTransfer.files);
          }}
          className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors mb-5"
          style={{
            borderColor: dragOver ? '#0d9488' : uploading ? '#94a3b8' : '#e2e8f0',
            background: dragOver ? '#f0fdfa' : '#f8fafc',
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />
          {uploading ? (
            <>
              <Loader2 size={22} className="text-teal-600 animate-spin" />
              <p className="text-sm font-medium text-slate-600">Uploading…</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">
                <UploadCloud size={18} className="text-teal-600" />
              </div>
              <p className="text-sm font-medium text-slate-600">Click to upload or drag & drop photos</p>
              <p className="text-xs text-slate-400">JPEG, PNG, WebP multiple files supported</p>
            </>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner size="lg" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-10">
            <Images size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No gallery photos yet for this edition.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img._id} className="relative group rounded-xl overflow-hidden border border-slate-100 aspect-square bg-slate-50">
                <img src={img.imageUrl} alt={img.caption || ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-start justify-end p-1.5">
                  <button
                    onClick={() => setDeleteId(img._id)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-white/90 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center transition-all"
                    title="Remove"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Photo"
        message="Remove this photo from the gallery? This cannot be undone."
        loading={deleting}
      />
    </>
  );
}
