import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, MessageSquare } from 'lucide-react';
import { testimonialsAPI } from '../../api/community';
import { truncate, buildFormData, getErrorMessage, getNextDisplayOrder, findDisplayOrderConflict } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import StatusToggle from '../../components/ui/StatusToggle';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

function StarRating({ rating }) {
  const n = Number(rating) || 0;
  return (
    <span className="text-amber-400 text-sm leading-none">
      {'★'.repeat(n)}
      <span className="text-slate-200">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">Rating</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
            className="text-2xl leading-none transition-transform hover:scale-125 focus:outline-none"
            style={{ color: n <= (hovered || value) ? '#f59e0b' : '#e2e8f0' }}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-xs text-slate-400">{value}/5</span>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [orderConflict, setOrderConflict] = useState(null);
  const [starRating, setStarRating] = useState(5);

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      await testimonialsAPI.update(item._id, { isActive: !item.isActive });
      setTestimonials((prev) => prev.map((t) => t._id === item._id ? { ...t, isActive: !t.isActive } : t));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await testimonialsAPI.getAll();
      setTestimonials(res.data.data || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setStarRating(5);
    reset({
      name: '',
      country: '',
      designation: '',
      message: '',
      isActive: true,
      displayOrder: getNextDisplayOrder(testimonials),
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setStarRating(Number(item.rating) || 5);
    reset({
      name: item.name || '',
      country: item.country || '',
      designation: item.designation || '',
      message: item.message || '',
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const executeSubmit = async (data) => {
    try {
      setSaving(true);
      const photoFiles = data.photo;
      const payload = {
        name: data.name,
        country: data.country || '',
        designation: data.designation || '',
        message: data.message,
        rating: starRating,
        isActive: data.isActive,
        displayOrder: data.displayOrder !== '' ? Number(data.displayOrder) : undefined,
      };
      if (photoFiles instanceof FileList && photoFiles.length > 0) {
        payload.photo = photoFiles[0];
      } else if (photoFiles instanceof File) {
        payload.photo = photoFiles;
      }
      const fd = buildFormData(payload);
      if (editingItem) {
        await testimonialsAPI.update(editingItem._id, fd);
        toast.success('Testimonial updated successfully.');
      } else {
        await testimonialsAPI.create(fd);
        toast.success('Testimonial added successfully.');
      }
      closeModal();
      fetchTestimonials();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data) => {
    if (!editingItem) {
      const conflict = findDisplayOrderConflict(testimonials, data.displayOrder);
      if (conflict) { setOrderConflict({ pending: data, conflict }); return; }
    }
    await executeSubmit(data);
  };

  const handleReplaceOrder = async () => {
    const { pending, conflict } = orderConflict;
    setOrderConflict(null);
    const newLast = getNextDisplayOrder(testimonials);
    try {
      await testimonialsAPI.update(conflict._id, { displayOrder: newLast });
      setTestimonials((prev) => prev.map((i) => i._id === conflict._id ? { ...i, displayOrder: newLast } : i));
    } catch {}
    await executeSubmit(pending);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await testimonialsAPI.delete(deleteTarget._id);
      toast.success('Testimonial deleted.');
      setDeleteTarget(null);
      fetchTestimonials();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        subtitle="Manage attendee and speaker testimonials"
        actionLabel="Add Testimonial"
        actionIcon={Plus}
        action={openAdd}
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : testimonials.length === 0 ? (
          <EmptyState
            message="No testimonials yet"
            description="Add the first testimonial from your attendees."
            action={openAdd}
            actionLabel="Add Testimonial"
            icon={MessageSquare}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Designation</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {testimonials.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-2 font-medium text-slate-800 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-2 text-slate-600">{item.country || ''}</td>
                    <td className="px-6 py-2 text-slate-600">{item.designation || ''}</td>
                    <td className="px-6 py-2 text-slate-500 max-w-[200px]">
                      {truncate(item.message, 60)}
                    </td>
                    <td className="px-6 py-2">
                      <StarRating rating={item.rating} />
                    </td>
                    <td className="px-6 py-2">
                      <StatusToggle
                        isActive={item.isActive}
                        loading={togglingId === item._id}
                        onToggle={() => toggleStatus(item)}
                      />
                    </td>
                    <td className="px-6 py-2 text-slate-600">{item.displayOrder ?? ''}</td>
                    <td className="px-6 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="testimonial-form" loading={saving}>
              {editingItem ? 'Save Changes' : 'Add Testimonial'}
            </Button>
          </>
        }
      >
        <form id="testimonial-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              name="name"
              register={register}
              required="Name is required"
              error={errors.name?.message}
              placeholder="Full name"
            />
            <ImageUpload
              label="Photo"
              name="photo"
              register={register}
              watch={watch}
              currentImage={editingItem?.photo || null}
              error={errors.photo?.message}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country"
              name="country"
              register={register}
              error={errors.country?.message}
              placeholder="e.g. India"
            />
            <Input
              label="Designation"
              name="designation"
              register={register}
              error={errors.designation?.message}
              placeholder="e.g. Professor"
            />
          </div>
          <Textarea
            label="Message"
            name="message"
            register={register}
            required="Message is required"
            error={errors.message?.message}
            placeholder="Testimonial text..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4 items-end">
            <StarPicker value={starRating} onChange={setStarRating} />
            <Input
              label="Display Order"
              name="displayOrder"
              type="number"
              register={register}
              error={errors.displayOrder?.message}
              placeholder="0"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
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
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the testimonial from "${deleteTarget?.name}"? This action cannot be undone.`}
        storageWarning={!!deleteTarget?.photo}
        confirmLabel="Delete"
      />
      <ConfirmDialog
        open={!!orderConflict}
        onClose={() => setOrderConflict(null)}
        onConfirm={handleReplaceOrder}
        title="Duplicate Display Order"
        message={`Display order ${orderConflict?.conflict?.displayOrder} is already used by "${orderConflict?.conflict?.name || 'another item'}". Proceeding will move that item to the end.`}
        confirmLabel="Replace"
      />
    </div>
  );
}
