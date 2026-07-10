import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Star, Plus, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ImageUpload from '../../components/ui/ImageUpload';
import { editionsAPI } from '../../api/congress';
import { formatDate, buildFormData, getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

export default function Editions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, isActive: false });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [settingActive, setSettingActive] = useState(null);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm();
  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({
    control,
    name: 'highlights',
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await editionsAPI.getAll();
      setItems(res.data.data);
    } catch {
      toast.error('Failed to load editions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openModal = (data = null) => {
    if (data) {
      reset({
        title: data.title,
        year: data.year,
        theme: data.theme,
        city: data.city,
        country: data.country,
        startDate: data.startDate ? data.startDate.slice(0, 10) : '',
        endDate: data.endDate ? data.endDate.slice(0, 10) : '',
        status: data.status,
        description: data.description,
        highlights: data.highlights?.length ? data.highlights : [],
      });
    } else {
      reset({});
    }
    setModal({ open: true, data });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const bannerFiles = formData.bannerImage;
      const payload = { ...formData };
      if (bannerFiles instanceof FileList && bannerFiles.length > 0) {
        payload.bannerImage = bannerFiles[0];
      } else if (bannerFiles instanceof File) {
        payload.bannerImage = bannerFiles;
      } else {
        delete payload.bannerImage;
      }
      const fd = buildFormData(payload);
      if (modal.data?._id) {
        await editionsAPI.update(modal.data._id, fd);
        toast.success('Edition updated successfully.');
      } else {
        await editionsAPI.create(fd);
        toast.success('Edition created successfully.');
      }
      setModal({ open: false, data: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (item) => {
    if (item.isActive) {
      toast.error('Cannot delete the active edition.');
      return;
    }
    setDeleteDialog({ open: true, id: item._id, isActive: item.isActive });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await editionsAPI.delete(deleteDialog.id);
      toast.success('Edition deleted.');
      setDeleteDialog({ open: false, id: null, isActive: false });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleSetActive = async (id) => {
    setSettingActive(id);
    try {
      await editionsAPI.setActive(id);
      toast.success('Edition set as active.');
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSettingActive(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="congress Editions"
        subtitle="Manage all congress editions"
        action={() => openModal()}
        actionLabel="Add Edition"
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No editions yet"
            description="Create your first congress edition."
            action={() => openModal()}
            actionLabel="Add Edition"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Is Active</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-6 py-3 text-slate-600">{item.year}</td>
                    <td className="px-6 py-3 text-slate-600">{item.city}, {item.country}</td>
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(item.startDate)} – {formatDate(item.endDate)}
                    </td>
                    <td className="px-6 py-3">{statusBadge(item.status)}</td>
                    <td className="px-6 py-3">
                      {item.isActive && (
                        <Badge variant="success">Current Edition</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!item.isActive && (
                          <button
                            onClick={() => handleSetActive(item._id)}
                            disabled={settingActive === item._id}
                            title="Set as active"
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-500 transition-colors"
                          >
                            {settingActive === item._id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Star size={15} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => openModal(item)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => confirmDelete(item)}
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
        title={modal.data ? 'Edit Edition' : 'Add Edition'}
        size="lg"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Title"
                name="title"
                register={register}
                error={errors.title?.message}
                placeholder="e.g. World Aging congress 2025"
                required
              />
            </div>
            <Input
              label="Year"
              name="year"
              type="number"
              register={register}
              error={errors.year?.message}
              placeholder="2025"
              required
            />
            <Select
              label="Status"
              name="status"
              register={register}
              error={errors.status?.message}
              options={statusOptions}
              required
            />
            <Input
              label="City"
              name="city"
              register={register}
              error={errors.city?.message}
              placeholder="e.g. Rome"
              required
            />
            <Input
              label="Country"
              name="country"
              register={register}
              error={errors.country?.message}
              placeholder="e.g. Italy"
              required
            />
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              register={register}
              error={errors.startDate?.message}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              register={register}
              error={errors.endDate?.message}
              required
            />
            <div className="col-span-2">
              <Input
                label="Theme"
                name="theme"
                register={register}
                error={errors.theme?.message}
                placeholder="e.g. Healthy Aging in the Modern World"
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label="Description"
                name="description"
                register={register}
                error={errors.description?.message}
                rows={3}
              />
            </div>

            <div className="col-span-2">
              <ImageUpload
                label="Banner Image"
                name="bannerImage"
                register={register}
                watch={watch}
                currentImage={modal.data?.bannerImage || null}
                error={errors.bannerImage?.message}
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Highlights <span className="text-slate-400">(e.g. Expected Attendees, Countries Represented)</span>
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => appendHighlight({ label: '', value: '' })}
                >
                  <Plus size={14} /> Add Highlight
                </Button>
              </div>

              {highlightFields.length === 0 ? (
                <p className="text-xs text-slate-400">No highlights added yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {highlightFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <Input
                        name={`highlights.${index}.label`}
                        register={register}
                        placeholder="Label (e.g. Expected Attendees)"
                        className="flex-1"
                      />
                      <Input
                        name={`highlights.${index}.value`}
                        register={register}
                        placeholder="Value (e.g. 1,200+)"
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove highlight"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, isActive: false })}
        onConfirm={handleDelete}
        title="Delete Edition"
        message="Are you sure you want to delete this edition? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
