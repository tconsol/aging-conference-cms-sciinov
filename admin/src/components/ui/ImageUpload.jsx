import { useEffect, useState } from 'react';
import { Upload, Image, CloudOff } from 'lucide-react';

export default function ImageUpload({ label, name, register, watch, error, currentImage, required }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [newFileSelected, setNewFileSelected] = useState(false);
  const watched = watch ? watch(name) : null;

  useEffect(() => {
    if (watched instanceof FileList && watched[0]) {
      const url = URL.createObjectURL(watched[0]);
      setPreview(url);
      setNewFileSelected(true);
      return () => URL.revokeObjectURL(url);
    }
    if (watched instanceof File) {
      const url = URL.createObjectURL(watched);
      setPreview(url);
      setNewFileSelected(true);
      return () => URL.revokeObjectURL(url);
    }
  }, [watched]);

  useEffect(() => {
    if (currentImage) { setPreview(currentImage); setNewFileSelected(false); }
  }, [currentImage]);

  const inputProps = register ? register(name, { required }) : {};
  const showReplaceWarning = newFileSelected && !!currentImage;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <label className="cursor-pointer group">
        <input type="file" accept="image/*" className="hidden" {...inputProps} />
        {preview ? (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-medium flex items-center gap-2">
                <Upload size={16} /> Change Image
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-40 rounded-xl border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2 bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
              <Image size={20} className="text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Click to upload image</p>
              <p className="text-xs text-slate-400 mt-0.5">JPEG, PNG, WebP up to 15MB</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Auto-converted to WebP &amp; optimised on upload</p>
            </div>
          </div>
        )}
      </label>

      {showReplaceWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <CloudOff size={13} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>GCP Cloud Storage:</strong> Saving will permanently delete the existing image from cloud storage.
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
