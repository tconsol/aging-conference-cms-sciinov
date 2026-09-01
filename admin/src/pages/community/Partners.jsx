import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, Globe } from 'lucide-react';
import { partnersAPI } from '../../api/community';
import { buildFormData, getErrorMessage, getNextDisplayOrder, findDisplayOrderConflict } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatusToggle from '../../components/ui/StatusToggle';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ImageUpload from '../../components/ui/ImageUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

const TYPE_OPTIONS = [
  { value: 'partner', label: 'Partner' },
  { value: 'media_partner', label: 'Media Partner' },
  { value: 'sponsor', label: 'Sponsor' },
];

const typeBadgeVariant = {
  partner: 'info',
  media_partner: 'teal',
  sponsor: 'purple',
};

const typeLabel = {
  partner: 'Partner',
  media_partner: 'Media Partner',
  sponsor: 'Sponsor',
};

export default function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [orderConflict, setOrderConflict] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      await partnersAPI.update(item._id, { isActive: !item.isActive });
      setPartners((prev) => prev.map((p) => p._id === item._id ? { ...p, isActive: !p.isActive } : p));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await partnersAPI.getAll();
      setPartners(res.data.data || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    reset({
      name: '',
      website: '',
      type: '',
      displayOrder: getNextDisplayOrder(partners),
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || '',
      website: item.website || '',
      type: item.type || '',
      displayOrder: item.displayOrder ?? '',
      isActive: item.isActive ?? true,
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
      const logoFiles = data.logo;
      const payload = {
        name: data.name,
        website: data.website || '',
        type: data.type,
        displayOrder: data.displayOrder !== '' ? Number(data.displayOrder) : undefined,
        isActive: data.isActive,
      };
      if (logoFiles instanceof FileList && logoFiles.length > 0) {
        payload.logo = logoFiles[0];
      } else if (logoFiles instanceof File) {
        payload.logo = logoFiles;
      }
      const fd = buildFormData(payload);
      if (editingItem) {
        await partnersAPI.update(editingItem._id, fd);
        toast.success('Partner updated successfully.');
      } else {
        await partnersAPI.create(fd);
        toast.success('Partner added successfully.');
      }
      closeModal();
      fetchPartners();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data) => {
    if (!editingItem) {
      const conflict = findDisplayOrderConflict(partners, data.displayOrder);
      if (conflict) { setOrderConflict({ pending: data, conflict }); return; }
    }
    await executeSubmit(data);
  };

  const handleReplaceOrder = async () => {
    const { pending, conflict } = orderConflict;
    setOrderConflict(null);
    const newLast = getNextDisplayOrder(partners);
    try {
      await partnersAPI.update(conflict._id, { displayOrder: newLast });
      setPartners((prev) => prev.map((i) => i._id === conflict._id ? { ...i, displayOrder: newLast } : i));
    } catch {}
    await executeSubmit(pending);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await partnersAPI.delete(deleteTarget._id);
      toast.success('Partner deleted.');
      setDeleteTarget(null);
      fetchPartners();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners & Logos"
        subtitle="Manage congress partners, media partners and sponsors"
        actionLabel="Add Partner"
        actionIcon={Plus}
        action={openAdd}
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : partners.length === 0 ? (
          <EmptyState
            message="No partners yet"
            description="Add your first partner, media partner or sponsor."
            action={openAdd}
            actionLabel="Add Partner"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {partners.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-slate-50"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                          <Globe size={16} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {item.website ? (
                        <a
                          href={item.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-700 hover:underline truncate max-w-[160px] block"
                        >
                          {item.website}
                        </a>
                      ) : (
                        <span className="text-slate-300"></span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={typeBadgeVariant[item.type] || 'default'}>
                        {typeLabel[item.type] || item.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <StatusToggle
                        isActive={item.isActive}
                        loading={togglingId === item._id}
                        onToggle={() => toggleStatus(item)}
                      />
                    </td>
                    <td className="px-6 py-3 text-slate-600">{item.displayOrder ?? ''}</td>
                    <td className="px-6 py-3 text-right">
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
        title={editingItem ? 'Edit Partner' : 'Add Partner'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="partner-form" loading={saving}>
              {editingItem ? 'Save Changes' : 'Add Partner'}
            </Button>
          </>
        }
      >
        <form id="partner-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            name="name"
            register={register}
            required="Name is required"
            error={errors.name?.message}
            placeholder="Partner name"
          />
          <ImageUpload
            label="Logo"
            name="logo"
            register={register}
            watch={watch}
            currentImage={editingItem?.logo || null}
            error={errors.logo?.message}
          />
          <Input
            label="Website"
            name="website"
            register={register}
            error={errors.website?.message}
            placeholder="https://example.com"
          />
          <Select
            label="Type"
            name="type"
            register={register}
            required="Type is required"
            error={errors.type?.message}
            options={TYPE_OPTIONS}
            placeholder="Select type..."
            defaultValue={editingItem?.type || ''}
          />
          <Input
            label="Display Order"
            name="displayOrder"
            type="number"
            register={register}
            error={errors.displayOrder?.message}
            placeholder="0"
          />
          <div className="flex items-center gap-3">
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
        title="Delete Partner"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        storageWarning={!!deleteTarget?.logo}
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
