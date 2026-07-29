import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Images, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { venuesAPI, editionsAPI } from '../../api/congress';
import { buildFormData, getErrorMessage } from '../../utils/helpers';

export default function Venue() {
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchEditions = async () => {
    try {
      const res = await editionsAPI.getAll();
      setEditions(res.data.data || []);
    } catch {
      toast.error('Failed to load editions.');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await venuesAPI.getAll();
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load venues.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
    fetchItems();
  }, []);

  const editionOptions = editions.map((e) => ({ value: e._id, label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})` }));

  const openModal = (data = null) => {
    if (data) {
      reset({
        name: data.name,
        edition: data.edition?._id || data.edition,
        address: data.address,
        city: data.city,
        country: data.country,
        mapEmbedCode: data.mapEmbedCode,
        description: data.description,
      });
    } else {
      reset({});
    }
    setModal({ open: true, data });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = { ...formData };
      const photoFiles = payload.photos;
      if (photoFiles instanceof FileList && photoFiles.length > 0) {
        payload.photos = photoFiles;
      } else {
        delete payload.photos;
      }
      const fd = buildFormData(payload);
      if (modal.data?._id) {
        await venuesAPI.update(modal.data._id, fd);
        toast.success('Venue updated successfully.');
      } else {
        await venuesAPI.create(fd);
        toast.success('Venue created successfully.');
      }
      setModal({ open: false, data: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePhoto = async (publicId) => {
    try {
      const res = await venuesAPI.removePhoto(modal.data._id, publicId);
      const updated = res.data.data;
      setModal((m) => ({ ...m, data: updated }));
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await venuesAPI.delete(deleteDialog.id);
      toast.success('Venue deleted.');
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
        title="Venues"
        subtitle="Manage congress venue information"
        action={() => openModal()}
        actionLabel="Add Venue"
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No venues yet"
            description="Add venue details for your congress."
            action={() => openModal()}
            actionLabel="Add Venue"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">City</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Edition</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Photos</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-3 text-slate-600">{item.city || '—'}</td>
                    <td className="px-6 py-3 text-slate-600">{item.country || '—'}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {item.edition?.title ? `${item.edition.title} (${item.edition.year})` : '—'}
                    </td>
                    <td className="px-6 py-3">
                      {item.photos?.length > 0 ? (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Images size={14} />
                          <span className="text-xs">{item.photos.length}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
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
        title={modal.data ? 'Edit Venue' : 'Add Venue'}
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
                label="Venue Name"
                name="name"
                register={register}
                error={errors.name?.message}
                placeholder="e.g. International Convention Centre"
                required
              />
            </div>
            <Select
              label="Edition"
              name="edition"
              register={register}
              error={errors.edition?.message}
              options={editionOptions}
              required
            />
            <Input
              label="City"
              name="city"
              register={register}
              error={errors.city?.message}
              placeholder="e.g. Rome"
            />
            <Input
              label="Country"
              name="country"
              register={register}
              error={errors.country?.message}
              placeholder="e.g. Italy"
            />
            <div className="col-span-2">
              <Textarea
                label="Address"
                name="address"
                register={register}
                error={errors.address?.message}
                rows={2}
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label="Google Maps Embed Code"
                name="mapEmbedCode"
                register={register}
                error={errors.mapEmbedCode?.message}
                rows={3}
              />
              <p className="text-xs text-slate-400 mt-1">Paste the Google Maps iframe embed code here.</p>
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
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Photos</label>
              {modal.data?.photos?.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {modal.data.photos.map((photo) => (
                    <div key={photo.publicId} className="relative group">
                      <img src={photo.url} alt="" className="w-full h-20 object-cover rounded-lg border border-slate-200" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.publicId)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                {...register('photos')}
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:text-sm hover:file:bg-slate-200"
              />
              <p className="text-xs text-slate-400 mt-1">Add up to 10 photos. New uploads are appended to existing photos.</p>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Venue"
        message="Are you sure you want to delete this venue? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
