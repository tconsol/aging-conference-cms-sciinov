import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, Package as PackageIcon, Star } from 'lucide-react';
import { packagesAPI } from '../../api/finance';
import { getErrorMessage, getNextDisplayOrder } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatusToggle from '../../components/ui/StatusToggle';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

// Sentinel, never stored: selecting it reveals a free-text field so a grouping
// beyond the three built-ins can be added without a code change.
const OTHER = '__other__';

const BUILT_IN_CATEGORIES = [
  { value: 'sponsorship', label: 'Sponsorship Packages' },
  { value: 'exhibitor', label: 'Exhibitor Packages' },
  { value: 'other', label: 'Other Packages' },
];

const categoryLabel = (value) =>
  BUILT_IN_CATEGORIES.find((c) => c.value === value)?.label ||
  String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) ||
  '—';

const categoryBadge = {
  sponsorship: 'purple',
  exhibitor: 'teal',
  other: 'info',
};

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await packagesAPI.getAll();
      setPackages(res.data?.data || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  // Categories already in the data, so a custom grouping entered once can be
  // reused from the dropdown instead of retyped (and misspelled) next time.
  const categoryOptions = useMemo(() => {
    const known = new Set(BUILT_IN_CATEGORIES.map((c) => c.value));
    const custom = [...new Set(packages.map((p) => p.category))]
      .filter((c) => c && !known.has(c))
      .map((c) => ({ value: c, label: categoryLabel(c) }));
    return [...BUILT_IN_CATEGORIES, ...custom, { value: OTHER, label: 'Other (enter your own)…' }];
  }, [packages]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const pkg of packages) {
      if (!map.has(pkg.category)) map.set(pkg.category, []);
      map.get(pkg.category).push(pkg);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }
    return [...map.entries()];
  }, [packages]);

  const openAdd = () => {
    setEditingItem(null);
    reset({
      name: '', category: 'sponsorship', customCategory: '',
      price: '', priceNote: '/ edition', perks: '', accentColor: '',
      highlight: false, displayOrder: getNextDisplayOrder(packages), isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const isCustom = item.category && !categoryOptions.some((o) => o.value === item.category);
    reset({
      name: item.name || '',
      category: isCustom ? OTHER : (item.category || 'sponsorship'),
      customCategory: isCustom ? item.category : '',
      price: item.price || '',
      priceNote: item.priceNote || '',
      // One perk per line is the least fiddly way to edit an ordered list.
      perks: (item.perks || []).join('\n'),
      accentColor: item.accentColor || '',
      highlight: item.highlight ?? false,
      displayOrder: item.displayOrder ?? '',
      isActive: item.isActive ?? true,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const payload = {
        name: data.name,
        category: data.category === OTHER
          ? data.customCategory.trim().toLowerCase().replace(/\s+/g, '_')
          : data.category,
        price: data.price || '',
        priceNote: data.priceNote || '',
        perks: data.perks.split('\n').map((p) => p.trim()).filter(Boolean),
        accentColor: data.accentColor || '',
        highlight: !!data.highlight,
        displayOrder: data.displayOrder !== '' ? Number(data.displayOrder) : 0,
        isActive: !!data.isActive,
      };
      if (editingItem) {
        await packagesAPI.update(editingItem._id, payload);
        toast.success('Package updated.');
      } else {
        await packagesAPI.create(payload);
        toast.success('Package created.');
      }
      setModalOpen(false);
      setEditingItem(null);
      fetchPackages();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      await packagesAPI.update(item._id, { isActive: !item.isActive });
      setPackages((prev) => prev.map((p) => p._id === item._id ? { ...p, isActive: !p.isActive } : p));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await packagesAPI.delete(deleteTarget._id);
      toast.success('Package deleted.');
      setDeleteTarget(null);
      fetchPackages();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sponsor / Exhibit Packages"
        subtitle="Packages shown on the public sponsorship page, grouped by category."
        action={openAdd}
        actionLabel="Add Package"
      />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : packages.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          message="No packages yet"
          description="Add sponsorship, exhibitor or other packages to show them on the public site."
          action={openAdd}
          actionLabel="Add Package"
        />
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-base font-bold text-slate-800">{categoryLabel(category)}</h2>
                <Badge variant={categoryBadge[category] || 'default'}>{items.length}</Badge>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Perks</th>
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">{item.name}</span>
                            {item.highlight && (
                              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                <Star size={10} /> Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 tabular-nums">
                          {item.price || '—'}
                          {item.priceNote && <span className="text-xs text-slate-400 ml-1">{item.priceNote}</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{item.perks?.length || 0}</td>
                        <td className="px-4 py-3 text-slate-500 tabular-nums">{item.displayOrder ?? 0}</td>
                        <td className="px-4 py-3">
                          <StatusToggle
                            isActive={item.isActive}
                            loading={togglingId === item._id}
                            onToggle={() => toggleStatus(item)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              aria-label={`Delete ${item.name}`}
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
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={editingItem ? 'Edit Package' : 'Add Package'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModalOpen(false); setEditingItem(null); }}>
              Cancel
            </Button>
            <Button type="submit" form="package-form" loading={saving}>
              {editingItem ? 'Save Changes' : 'Create Package'}
            </Button>
          </>
        }
      >
        <form id="package-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Package Name" name="name" register={register}
            required="Name is required" error={errors.name?.message}
            placeholder="e.g. Platinum"
          />

          <Select
            label="Category" name="category" register={register}
            required="Category is required" error={errors.category?.message}
            options={categoryOptions}
            placeholder="Select category..."
            defaultValue={editingItem?.category || 'sponsorship'}
          />
          {watch('category') === OTHER && (
            <Input
              label="Custom Category" name="customCategory" register={register}
              required="Enter the custom category"
              error={errors.customCategory?.message}
              placeholder="e.g. Workshop Packages"
              hint="Becomes its own section on the public page."
            />
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Price" name="price" register={register}
              error={errors.price?.message}
              placeholder="$25,000"
              hint="Free text — “On request” works too."
            />
            <Input
              label="Price Note" name="priceNote" register={register}
              error={errors.priceNote?.message}
              placeholder="/ edition"
            />
          </div>

          <Textarea
            label="Perks" name="perks" register={register}
            rows={8}
            error={errors.perks?.message}
            placeholder={'One perk per line, e.g.\nPremier logo on all congress materials\nKeynote session naming rights'}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Accent Colour" name="accentColor" register={register}
              error={errors.accentColor?.message}
              placeholder="#b45309"
              hint="Optional hex for the tier name."
            />
            <Input
              label="Display Order" name="displayOrder" type="number" register={register}
              error={errors.displayOrder?.message}
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="pkg-highlight" {...register('highlight')}
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            <label htmlFor="pkg-highlight" className="text-sm font-medium text-slate-700">
              Feature this package (dark, raised card — use for one per category)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="pkg-active" {...register('isActive')}
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            <label htmlFor="pkg-active" className="text-sm font-medium text-slate-700">Active</label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Package"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
