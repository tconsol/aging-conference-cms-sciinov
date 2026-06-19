import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2, FolderOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ImageUpload from '../../components/ui/ImageUpload';
import FileUpload from '../../components/ui/FileUpload';
import { downloadsAPI } from '../../api/content';
import { getErrorMessage } from '../../utils/helpers';

const typeOptions = [
  { value: 'template', label: 'Template' },
  { value: 'flyer', label: 'Flyer' },
  { value: 'pdf', label: 'PDF' },
  { value: 'brochure', label: 'Brochure' },
  { value: 'other', label: 'Other' },
];

const typeVariantMap = {
  template: 'info',
  flyer: 'purple',
  pdf: 'danger',
  brochure: 'teal',
  other: 'default',
};

export default function Downloads() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      const res = await downloadsAPI.getAll();
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
        type: data.type || '',
        isActive: data.isActive ?? true,
        displayOrder: data.displayOrder ?? 0,
      });
    } else {
      reset({ isActive: true, displayOrder: 0 });
    }
    setModal({ open: true, data });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('type', formData.type || '');
      fd.append('isActive', formData.isActive ? 'true' : 'false');
      fd.append('displayOrder', formData.displayOrder ?? 0);

      const thumbnailFiles = formData.thumbnail;
      if (thumbnailFiles instanceof FileList && thumbnailFiles[0]) {
        fd.append('thumbnail', thumbnailFiles[0]);
      } else if (thumbnailFiles instanceof File) {
        fd.append('thumbnail', thumbnailFiles);
      }

      const fileFiles = formData.file;
      if (fileFiles instanceof FileList && fileFiles[0]) {
        fd.append('file', fileFiles[0]);
      } else if (fileFiles instanceof File) {
        fd.append('file', fileFiles);
      }

      if (modal.data?._id) {
        await downloadsAPI.update(modal.data._id, fd);
        toast.success('Download updated.');
      } else {
        await downloadsAPI.create(fd);
        toast.success('Download created.');
      }
      setModal({ open: false, data: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await downloadsAPI.delete(deleteDialog.id);
      toast.success('Download deleted.');
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
        title="Downloads"
        subtitle="Manage quick download files"
        action={() => openModal()}
        actionLabel="Add Download"
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No downloads yet"
            description="Add your first downloadable file."
            action={() => openModal()}
            actionLabel="Add Download"
            icon={FolderOpen}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Thumbnail</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-10 h-10 object-cover rounded border border-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                          <FolderOpen size={14} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-4 py-3">
                      {item.type ? (
                        <Badge variant={typeVariantMap[item.type] || 'default'} className="capitalize">
                          {item.type}
                        </Badge>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.displayOrder}</td>
                    <td className="px-4 py-3">
                      {item.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="default">Inactive</Badge>
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
        title={modal.data ? 'Edit Download' : 'Add Download'}
        size="md"
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
            placeholder="Download title"
            required
          />
          <Select
            label="Type"
            name="type"
            register={register}
            options={typeOptions}
            placeholder="Select type"
          />
          <FileUpload
            label="File"
            name="file"
            register={register}
            watch={watch}
            currentFile={modal.data?.fileUrl}
            required={!modal.data}
          />
          <ImageUpload
            label="Thumbnail"
            name="thumbnail"
            register={register}
            watch={watch}
            currentImage={modal.data?.thumbnail}
          />
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
                id="isActive"
                {...register('isActive')}
                className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Active
              </label>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Download"
        message="Are you sure you want to delete this download? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
