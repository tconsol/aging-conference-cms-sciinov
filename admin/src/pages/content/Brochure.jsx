import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Trash2, Download, FileText, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FileUpload from '../../components/ui/FileUpload';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Dropdown from '../../components/ui/Dropdown';
import { brochureAPI } from '../../api/content';
import { editionsAPI } from '../../api/congress';
import { formatDate, getErrorMessage } from '../../utils/helpers';

export default function Brochure() {
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const fetchEditions = async () => {
    try {
      const res = await editionsAPI.getAll();
      setEditions(res.data.data || []);
    } catch {
      // non-critical
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await brochureAPI.getAll();
      setItems(res.data.data || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
    fetchItems();
  }, []);

  const onSubmit = async (formData) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      if (formData.edition) fd.append('edition', formData.edition);

      const fileFiles = formData.file;
      if (fileFiles instanceof FileList && fileFiles[0]) {
        fd.append('file', fileFiles[0]);
      } else if (fileFiles instanceof File) {
        fd.append('file', fileFiles);
      }

      await brochureAPI.upload(fd);
      toast.success('Brochure uploaded successfully.');
      reset({});
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await brochureAPI.delete(deleteDialog.id);
      toast.success('Brochure deleted.');
      setDeleteDialog({ open: false, id: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Brochures"
        subtitle="Manage congress brochure PDFs"
      />

      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Upload Brochure</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input
            label="Title"
            name="title"
            register={register}
            error={errors.title?.message}
            placeholder="e.g. congress Brochure 2025"
            required
          />
          <Select
            label="Edition"
            name="edition"
            register={register}
            error={errors.edition?.message}
            options={editions.map((e) => ({ value: e._id, label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})` }))}
            placeholder="Select Edition (optional)"
          />
          <FileUpload
            label="PDF File"
            name="file"
            register={register}
            watch={watch}
            accept=".pdf"
            required
          />
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" loading={uploading}>
              <Upload size={15} />
              {uploading ? 'Uploading...' : 'Upload Brochure'}
            </Button>
          </div>
        </form>
      </div>

      {/* Brochure List */}
      <div>
        <h2 className="text-base font-semibold text-slate-700 mb-4">Uploaded Brochures</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
            <EmptyState
              message="No brochures uploaded"
              description="Upload your first brochure PDF above."
              icon={FileText}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-12 rounded bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100">
                    <FileText size={20} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate" title={item.title}>
                      {item.title}
                    </p>
                    {item.edition && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.edition.title || item.edition}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(item.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {item.fileUrl && (
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-700 transition-colors"
                    >
                      <Download size={13} />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => setDeleteDialog({ open: true, id: item._id })}
                    className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Brochure"
        message="Are you sure you want to delete this brochure? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
