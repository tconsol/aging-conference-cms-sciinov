import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ImageUpload from '../../components/ui/ImageUpload';
import FileUpload from '../../components/ui/FileUpload';
import { reportsAPI } from '../../api/content';
import { truncate, getErrorMessage, getNextDisplayOrder, findDisplayOrderConflict } from '../../utils/helpers';

export default function Reports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [orderConflict, setOrderConflict] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getAll();
      setItems(res.data.data || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openModal = (data = null) => {
    if (data) {
      reset({
        title: data.title || '',
        description: data.description || '',
        isPublished: data.isPublished ?? false,
        displayOrder: data.displayOrder ?? 0,
      });
    } else {
      reset({ isPublished: false, displayOrder: getNextDisplayOrder(items) });
    }
    setModal({ open: true, data });
  };

  const executeSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description || '');
      fd.append('isPublished', formData.isPublished ? 'true' : 'false');
      fd.append('displayOrder', formData.displayOrder ?? 0);

      const coverImageFiles = formData.coverImage;
      if (coverImageFiles instanceof FileList && coverImageFiles[0]) {
        fd.append('coverImage', coverImageFiles[0]);
      } else if (coverImageFiles instanceof File) {
        fd.append('coverImage', coverImageFiles);
      }

      const fileFiles = formData.file;
      if (fileFiles instanceof FileList && fileFiles[0]) {
        fd.append('file', fileFiles[0]);
      } else if (fileFiles instanceof File) {
        fd.append('file', fileFiles);
      }

      if (modal.data?._id) {
        await reportsAPI.update(modal.data._id, fd);
        toast.success('Report updated.');
      } else {
        await reportsAPI.create(fd);
        toast.success('Report created.');
      }
      setModal({ open: false, data: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (formData) => {
    if (!modal.data?._id) {
      const conflict = findDisplayOrderConflict(items, formData.displayOrder);
      if (conflict) { setOrderConflict({ pending: formData, conflict }); return; }
    }
    await executeSubmit(formData);
  };

  const handleReplaceOrder = async () => {
    const { pending, conflict } = orderConflict;
    setOrderConflict(null);
    const newLast = getNextDisplayOrder(items);
    try {
      await reportsAPI.update(conflict._id, { displayOrder: newLast });
      setItems((prev) => prev.map((i) => i._id === conflict._id ? { ...i, displayOrder: newLast } : i));
    } catch {}
    await executeSubmit(pending);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await reportsAPI.delete(deleteDialog.id);
      toast.success('Report deleted.');
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
        title="Market Reports"
        subtitle="Manage downloadable reports"
        action={() => openModal()}
        actionLabel="Add Report"
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No reports yet"
            description="Upload your first market report."
            action={() => openModal()}
            actionLabel="Add Report"
            icon={BookOpen}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Cover</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Published</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      {item.coverImage ? (
                        <img
                          src={item.coverImage}
                          alt={item.title}
                          className="w-10 h-12 object-cover rounded border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-12 rounded bg-slate-100 flex items-center justify-center">
                          <BookOpen size={14} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">
                      <span title={item.description}>{truncate(item.description, 70)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.displayOrder}</td>
                    <td className="px-4 py-3">
                      {item.isPublished ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ open: true, id: item._id })}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        title={modal.data ? 'Edit Report' : 'Add Report'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal({ open: false, data: null })}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
              {modal.data ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Title"
            name="title"
            register={register}
            error={errors.title?.message}
            placeholder="Report title"
            required
          />
          <Textarea
            label="Description"
            name="description"
            register={register}
            placeholder="Brief description of this report..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload
              label="Cover Image"
              name="coverImage"
              register={register}
              watch={watch}
              currentImage={modal.data?.coverImage}
            />
            <FileUpload
              label="Report File (PDF)"
              name="file"
              register={register}
              watch={watch}
              accept=".pdf"
              currentFile={modal.data?.fileUrl}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <Input
              label="Display Order"
              name="displayOrder"
              type="number"
              register={register}
              placeholder="0"
            />
            <div className="flex items-center gap-2 pb-1">
              <input
                type="checkbox"
                id="isPublished"
                {...register('isPublished')}
                className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-slate-700">
                Published
              </label>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        loading={deleting}
        storageWarning
      />
      <ConfirmDialog
        open={!!orderConflict}
        onClose={() => setOrderConflict(null)}
        onConfirm={handleReplaceOrder}
        title="Duplicate Display Order"
        message={`Display order ${orderConflict?.conflict?.displayOrder} is already used by "${orderConflict?.conflict?.title || 'another item'}". Proceeding will move that item to the end.`}
        confirmLabel="Replace"
      />
    </div>
  );
}
