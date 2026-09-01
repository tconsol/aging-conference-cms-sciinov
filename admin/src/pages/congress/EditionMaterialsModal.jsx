import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BookOpen, FileText, Upload, ExternalLink, File as FileIcon } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import { editionsAPI } from '../../api/congress';
import { getErrorMessage } from '../../utils/helpers';

function DocField({ label, name, register, watch, currentUrl, currentName }) {
  const watched = watch(name);
  const selected = watched instanceof FileList && watched.length > 0 ? watched[0] : null;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-teal-400 bg-slate-50 cursor-pointer transition-colors group">
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" {...register(name)} />
        <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-teal-300">
          <FileIcon size={16} className="text-slate-400 group-hover:text-teal-600" />
        </div>
        <div className="min-w-0 flex-1">
          {selected ? (
            <>
              <p className="text-sm font-medium text-teal-700 truncate">{selected.name}</p>
              <p className="text-xs text-slate-400">New file selected will replace current on save</p>
            </>
          ) : currentUrl ? (
            <>
              <p className="text-sm font-medium text-slate-700 truncate">{currentName || 'Uploaded file'}</p>
              <p className="text-xs text-slate-400">Click to replace</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-500">Click to upload PDF / DOC</p>
              <p className="text-xs text-slate-400">Up to 20MB</p>
            </>
          )}
        </div>
        <Upload size={15} className="text-slate-300 group-hover:text-teal-500 flex-shrink-0" />
      </label>
      {currentUrl && !selected && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline w-fit"
        >
          <ExternalLink size={11} /> View current file
        </a>
      )}
    </div>
  );
}

export default function EditionMaterialsModal({ open, onClose, edition, onSaved }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm();

  useEffect(() => {
    if (open && edition) {
      reset({
        bookTitle: edition.conferenceBook?.title || 'Conference Book',
        programTitle: edition.conferenceProgram?.title || 'Conference Program',
      });
    }
  }, [open, edition, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('bookTitle', data.bookTitle || '');
      fd.append('programTitle', data.programTitle || '');
      if (data.bookCoverImage instanceof FileList && data.bookCoverImage[0]) fd.append('bookCoverImage', data.bookCoverImage[0]);
      if (data.bookFile instanceof FileList && data.bookFile[0]) fd.append('bookFile', data.bookFile[0]);
      if (data.programCoverImage instanceof FileList && data.programCoverImage[0]) fd.append('programCoverImage', data.programCoverImage[0]);
      if (data.programFile instanceof FileList && data.programFile[0]) fd.append('programFile', data.programFile[0]);

      const res = await editionsAPI.updateMaterials(edition._id, fd);
      toast.success('Materials updated.');
      onSaved?.(res.data.data);
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!edition) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Materials ${edition.title}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" form="edition-materials-form" loading={saving}>Save Materials</Button>
        </>
      }
    >
      <form id="edition-materials-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Conference Book */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
              <BookOpen size={13} className="text-teal-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Conference Book</h3>
          </div>
          <div className="space-y-4 pl-1">
            <Input label="Display Title" name="bookTitle" register={register} placeholder="Conference Book" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload
                label="Cover Image"
                name="bookCoverImage"
                register={register}
                watch={watch}
                currentImage={edition.conferenceBook?.coverImage || null}
              />
              <DocField
                label="Book File (PDF)"
                name="bookFile"
                register={register}
                watch={watch}
                currentUrl={edition.conferenceBook?.fileUrl}
                currentName={edition.conferenceBook?.fileName}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Conference Program */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <FileText size={13} className="text-blue-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Conference Program</h3>
          </div>
          <div className="space-y-4 pl-1">
            <Input label="Display Title" name="programTitle" register={register} placeholder="Conference Program" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUpload
                label="Cover Image"
                name="programCoverImage"
                register={register}
                watch={watch}
                currentImage={edition.conferenceProgram?.coverImage || null}
              />
              <DocField
                label="Program File (PDF)"
                name="programFile"
                register={register}
                watch={watch}
                currentUrl={edition.conferenceProgram?.fileUrl}
                currentName={edition.conferenceProgram?.fileName}
              />
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
