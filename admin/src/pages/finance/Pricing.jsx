import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Tag } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import Badge, { statusBadge } from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { pricingAPI } from '../../api/finance';
import { editionsAPI } from '../../api/congress';
import { formatDate, formatCurrency, CATEGORY_LABELS, getErrorMessage } from '../../utils/helpers';

const tierNameOptions = [
  { value: 'early_bird', label: 'Early Bird' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'on_spot', label: 'On Spot' },
];

const PRICE_FIELDS = Object.keys(CATEGORY_LABELS);

export default function Pricing() {
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editionFilter, setEditionFilter] = useState('');
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
    if (data) {
      const defaults = { edition: data.edition?._id || data.edition, name: data.name, label: data.label || '', deadline: data.deadline ? data.deadline.slice(0, 10) : '', isActive: data.isActive };
      PRICE_FIELDS.forEach((key) => {
        defaults[key] = data.prices?.[key] ?? '';
      });
      reset(defaults);
    } else {
      reset({ isActive: true });
    }
    setModal({ open: true, data });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const prices = {};
      PRICE_FIELDS.forEach((key) => {
        if (formData[key] !== '' && formData[key] !== undefined) {
          prices[key] = Number(formData[key]);
        }
      });
      const payload = {
        edition: formData.edition,
        name: formData.name,
        label: formData.label,
        deadline: formData.deadline,
        isActive: formData.isActive === true || formData.isActive === 'true',
        prices,
      };
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

  const editionOptions = editions.map((e) => ({ value: e._id, label: `${e.title} (${e.year})` }));

  return (
    <div>
      <PageHeader
        title="Pricing Tiers"
        subtitle="Manage registration pricing"
        action={() => openModal()}
        actionLabel="Add Tier"
      />

      {/* Edition filter */}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Tier Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Edition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Label</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Prices</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800 capitalize">
                      {tierNameOptions.find((o) => o.value === item.name)?.label || item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.edition?.title || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{item.label || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(item.deadline)}</td>
                    <td className="px-4 py-3">
                      {item.prices ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(item.prices).slice(0, 3).map(([key, val]) => (
                            <span key={key} className="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5">
                              {CATEGORY_LABELS[key]?.split(' ')[0]}: {formatCurrency(val)}
                            </span>
                          ))}
                          {Object.keys(item.prices).length > 3 && (
                            <span className="text-xs text-slate-400">+{Object.keys(item.prices).length - 3} more</span>
                          )}
                        </div>
                      ) : '—'}
                    </td>
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
            />
            <Select
              label="Tier Name"
              name="name"
              register={register}
              error={errors.name?.message}
              options={tierNameOptions}
              placeholder="Select Tier"
              required
            />
            <Input
              label="Label"
              name="label"
              register={register}
              placeholder="e.g. Early Registration"
            />
            <Input
              label="Deadline"
              name="deadline"
              type="date"
              register={register}
            />
          </div>

          {/* isActive checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              {...register('isActive')}
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Active (visible to registrants)
            </label>
          </div>

          {/* Prices section */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Prices by Category</p>
            <div className="grid grid-cols-2 gap-3">
              {PRICE_FIELDS.map((key) => (
                <Input
                  key={key}
                  label={CATEGORY_LABELS[key]}
                  name={key}
                  type="number"
                  register={register}
                  placeholder="0.00"
                />
              ))}
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Pricing Tier"
        message="Are you sure you want to delete this pricing tier? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}
