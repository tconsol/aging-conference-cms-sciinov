import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Tag, Plus, X, Zap, Hand } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import StatusToggle from '../../components/ui/StatusToggle';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { pricingAPI } from '../../api/finance';
import { editionsAPI } from '../../api/congress';
import { formatDate, formatCurrency, CATEGORY_LABELS, categoryLabel, getErrorMessage } from '../../utils/helpers';

const tierNameOptions = [
  { value: 'early_bird', label: 'Early Bird' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'on_spot', label: 'On Spot' },
];

const DEFAULT_CATEGORIES = Object.keys(CATEGORY_LABELS);

// "Workshop (In-Person)" -> workshop_inperson
const slugifyCategory = (text) =>
  String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\(in[-\s]?person\)/g, 'inperson')
    .replace(/\(virtual\)/g, 'virtual')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toDateInput = (d) => (d ? String(d).slice(0, 10) : '');

export default function Pricing() {
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editionFilter, setEditionFilter] = useState('');
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // Category keys shown in the modal  defaults plus whatever this tier already has
  const [categoryKeys, setCategoryKeys] = useState(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const autoActivate = watch('autoActivate');

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      // Flipping by hand implies manual control, otherwise the next read would
      // just roll it back to whatever the dates say
      await pricingAPI.update(item._id, { isActive: !item.isActive, autoActivate: false });
      toast.success('Status updated. This tier is now managed manually.');
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

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
      const params = {};
      if (editionFilter) params.edition = editionFilter;
      const res = await pricingAPI.getAll(params);
      setItems(res.data.data || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchItems(); }, [editionFilter]);

  const openModal = (data = null) => {
    setNewCategory('');

    if (data) {
      const priceKeys = Object.keys(data.prices || {});
      const keys = [...new Set([...DEFAULT_CATEGORIES, ...priceKeys])];
      setCategoryKeys(keys);

      const defaults = {
        edition: data.edition?._id || data.edition,
        name: data.name,
        label: data.label || '',
        startDate: toDateInput(data.startDate),
        endDate: toDateInput(data.endDate || data.deadline),
        autoActivate: data.autoActivate !== false,
        isActive: data.isActive,
      };
      keys.forEach((key) => { defaults[key] = data.prices?.[key] ?? ''; });
      reset(defaults);
    } else {
      setCategoryKeys(DEFAULT_CATEGORIES);
      reset({ autoActivate: true, isActive: false });
    }
    setModal({ open: true, data });
  };

  const addCategory = () => {
    const key = slugifyCategory(newCategory);
    if (!key) { toast.error('Enter a category name.'); return; }
    if (categoryKeys.includes(key)) { toast.error('That category already exists.'); return; }
    setCategoryKeys((prev) => [...prev, key]);
    setNewCategory('');
  };

  const removeCategory = (key) => {
    setCategoryKeys((prev) => prev.filter((k) => k !== key));
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const prices = {};
      categoryKeys.forEach((key) => {
        if (formData[key] !== '' && formData[key] !== undefined) {
          prices[key] = Number(formData[key]);
        }
      });

      const auto = formData.autoActivate === true || formData.autoActivate === 'true';
      const payload = {
        edition: formData.edition,
        name: formData.name,
        label: formData.label,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        // keep the legacy field in step so older readers still work
        deadline: formData.endDate || undefined,
        autoActivate: auto,
        prices,
      };
      // When dates drive activation the server decides isActive
      if (!auto) payload.isActive = formData.isActive === true || formData.isActive === 'true';

      if (modal.data?._id) {
        await pricingAPI.update(modal.data._id, payload);
        toast.success('Pricing tier updated.');
      } else {
        await pricingAPI.create(payload);
        toast.success('Pricing tier created.');
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
      await pricingAPI.delete(deleteDialog.id);
      toast.success('Pricing tier deleted.');
      setDeleteDialog({ open: false, id: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const editionOptions = editions.map((e) => ({
    value: e._id,
    label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})`,
  }));

  return (
    <div>
      <PageHeader
        title="Pricing Tiers"
        subtitle="Windows roll over automatically as each deadline passes"
        action={() => openModal()}
        actionLabel="Add Tier"
      />

      <div className="mb-4">
        <Dropdown
          value={editionFilter}
          onChange={setEditionFilter}
          options={[{ value: '', label: 'All Editions' }, ...editionOptions]}
          className="w-56"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            message="No pricing tiers"
            description="Add your first pricing tier."
            action={() => openModal()}
            actionLabel="Add Tier"
            icon={Tag}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Edition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Window</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Control</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Prices</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Open</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => {
                  const auto = item.autoActivate !== false;
                  const end = item.endDate || item.deadline;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {tierNameOptions.find((o) => o.value === item.name)?.label || item.name}
                        </p>
                        {item.label && <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.edition?.title || ''}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-xs">
                        {item.startDate ? formatDate(item.startDate) : 'on previous close'}
                        <span className="text-slate-300 mx-1.5">to</span>
                        {end ? formatDate(end) : 'no end'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                            auto ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
                          }`}
                          title={auto ? 'Opens and closes on its dates' : 'Controlled by hand'}
                        >
                          {auto ? <Zap size={11} /> : <Hand size={11} />}
                          {auto ? 'Automatic' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.prices ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item.prices).slice(0, 3).map(([key, val]) => (
                              <span key={key} className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
                                {categoryLabel(key).split(' ')[0]}: {formatCurrency(val)}
                              </span>
                            ))}
                            {Object.keys(item.prices).length > 3 && (
                              <span className="text-xs text-slate-400">
                                +{Object.keys(item.prices).length - 3} more
                              </span>
                            )}
                          </div>
                        ) : ''}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, data: null })}
        title={modal.data ? 'Edit Pricing Tier' : 'Add Pricing Tier'}
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
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Edition"
              name="edition"
              register={register}
              error={errors.edition?.message}
              options={editionOptions}
              placeholder="Select Edition"
              required
              defaultValue={modal.data?.edition?._id || modal.data?.edition || ''}
            />
            <Select
              label="Tier Name"
              name="name"
              register={register}
              error={errors.name?.message}
              options={tierNameOptions}
              placeholder="Select Tier"
              required
              defaultValue={modal.data?.name || ''}
            />
            <div className="col-span-2">
              <Input
                label="Label"
                name="label"
                register={register}
                placeholder="e.g. Early Registration"
              />
            </div>
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              register={register}
              hint="Leave blank to open when the previous tier closes"
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              register={register}
              hint="Also published to Important Dates"
            />
          </div>

          {/* Activation mode */}
          <div className="rounded-xl border border-slate-200 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('autoActivate')}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
              />
              <span>
                <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                  <Zap size={13} className="text-teal-600" />
                  Open and close on these dates
                </span>
                <span className="block text-xs text-slate-500 mt-0.5">
                  When the end date passes, this tier closes and the next one opens on its own.
                </span>
              </span>
            </label>

            {!autoActivate && (
              <label className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Active (visible to registrants)
                </span>
              </label>
            )}
          </div>

          {/* Prices */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">Prices by Category</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categoryKeys.map((key) => {
                const custom = !DEFAULT_CATEGORIES.includes(key);
                return (
                  <div key={key} className="relative">
                    <Input
                      label={categoryLabel(key)}
                      name={key}
                      type="number"
                      step="0.01"
                      register={register}
                      placeholder="0.00"
                    />
                    {custom && (
                      <button
                        type="button"
                        onClick={() => removeCategory(key)}
                        title="Remove this category"
                        className="absolute top-0 right-0 p-1 text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add a custom category */}
            <div className="flex items-end gap-2 mt-4 pt-4 border-t border-slate-100">
              <Input
                label="Add a category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                placeholder="e.g. Workshop (In-Person)"
                className="flex-1"
                hint="Saved with this tier and offered to registrants"
              />
              <Button type="button" variant="secondary" onClick={addCategory} className="mb-6">
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Pricing Tier"
        message="Delete this pricing tier? Its generated entry in Important Dates is removed too. This cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
