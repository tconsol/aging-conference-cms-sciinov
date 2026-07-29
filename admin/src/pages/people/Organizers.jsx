import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import StatusToggle from '../../components/ui/StatusToggle';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ImageUpload from '../../components/ui/ImageUpload';
import { organizersAPI } from '../../api/people';
import { buildFormData, getErrorMessage } from '../../utils/helpers';

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-green-100 text-green-700',
  'bg-indigo-100 text-indigo-700',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

function getColorClass(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return avatarColors[hash % avatarColors.length];
}

export default function Organizers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      await organizersAPI.update(item._id, { isActive: !item.isActive });
      setItems((prev) => prev.map((o) => o._id === item._id ? { ...o, isActive: !o.isActive } : o));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await organizersAPI.getAll();
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load organizers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openModal = (data = null) => {
    if (data) {
      reset({
        name: data.name,
        designation: data.designation,
        bio: data.bio,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      });
      setCurrentPhoto(data.photo || null);
    } else {
      reset({ isActive: true });
      setCurrentPhoto(null);
    }
    setModal({ open: true, data });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const fd = buildFormData(formData);
      if (modal.data?._id) {
        await organizersAPI.update(modal.data._id, fd);
        toast.success('Organizer updated successfully.');
      } else {
        await organizersAPI.create(fd);
        toast.success('Organizer created successfully.');
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
      await organizersAPI.delete(deleteDialog.id);
      toast.success('Organizer deleted.');
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
        title="Organizers"
        subtitle="Manage congress organizer profiles"
        action={() => openModal()}
        actionLabel="Add Organizer"
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No organizers yet"
            description="Add organizer profiles for the congress."
            action={() => openModal()}
            actionLabel="Add Organizer"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Photo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${getColorClass(item.name)}`}
                        >
                          {getInitials(item.name)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-3 text-slate-600">{item.designation || '—'}</td>
                    <td className="px-6 py-3 text-slate-600">{item.displayOrder ?? '—'}</td>
                    <td className="px-6 py-3">
                      <StatusToggle
                        isActive={item.isActive}
                        loading={togglingId === item._id}
                        onToggle={() => toggleStatus(item)}
                      />
                    </td>
                    <td className="px-6 py-3">
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

      {/* Add/Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        title={modal.data ? 'Edit Organizer' : 'Add Organizer'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal({ open: false, data: null })}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(onSubmit)} disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : null}
              {modal.data ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Name"
            name="name"
            register={register}
            error={errors.name?.message}
            placeholder="e.g. Dr. Maria Garcia"
            required
          />
          <Input
            label="Designation"
            name="designation"
            register={register}
            error={errors.designation?.message}
            placeholder="e.g. congress Chair"
          />
          <Textarea
            label="Bio"
            name="bio"
            register={register}
            error={errors.bio?.message}
            rows={4}
          />
          <ImageUpload
            label="Photo"
            name="photo"
            register={register}
            watch={watch}
            error={errors.photo?.message}
            currentImage={currentPhoto}
          />
          <Input
            label="Display Order"
            name="displayOrder"
            type="number"
            register={register}
            error={errors.displayOrder?.message}
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              {...register('isActive')}
            />
            Active (visible on website)
          </label>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Organizer"
        message="Are you sure you want to delete this organizer?"
        loading={deleting}
      />
    </div>
  );
}
