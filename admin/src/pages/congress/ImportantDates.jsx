import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { datesAPI, editionsAPI } from '../../api/congress';
import { formatDate, getErrorMessage } from '../../utils/helpers';

const categoryOptions = [
  { value: 'abstracts', label: 'Abstracts' },
  { value: 'registrations', label: 'Registrations' },
  { value: 'congress', label: 'congress' },
  { value: 'other', label: 'Other' },
];

const categoryBadge = (category) => {
  const map = {
    abstracts: { label: 'Abstracts', variant: 'info' },
    registrations: { label: 'Registrations', variant: 'success' },
    congress: { label: 'congress', variant: 'purple' },
    other: { label: 'Other', variant: 'default' },
  };
  const cfg = map[category] || { label: category, variant: 'default' };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
};

export default function ImportantDates() {
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEdition, setFilterEdition] = useState('');
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
      const params = filterEdition ? { edition: filterEdition } : {};
      const res = await datesAPI.getAll(params);
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load important dates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchItems(); }, [filterEdition]);

  const editionOptions = editions.map((e) => ({ value: e._id, label: `${e.title} (${e.year})` }));

  const openModal = (data = null) => {
    if (data) {
      reset({
        edition: data.edition?._id || data.edition,
        label: data.label,
        date: data.date ? data.date.slice(0, 10) : '',
        category: data.category,
        isHighlighted: data.isHighlighted,
        displayOrder: data.displayOrder,
      });
    } else {
      reset({ isHighlighted: false });
    }
    setModal({ open: true, data });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (modal.data?._id) {
        await datesAPI.update(modal.data._id, formData);
        toast.success('Date updated successfully.');
      } else {
        await datesAPI.create(formData);
        toast.success('Date created successfully.');
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
      await datesAPI.delete(deleteDialog.id);
      toast.success('Date deleted.');
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
        title="Important Dates"
        subtitle="Deadlines and key congress dates"
        action={() => openModal()}
        actionLabel="Add Date"
      />

      {/* Filter */}
      <div className="mb-4">
        <Dropdown
          value={filterEdition}
          onChange={setFilterEdition}
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
            message="No important dates"
            description="Add deadlines and key dates for the congress."
            action={() => openModal()}
            actionLabel="Add Date"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Label</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Highlighted</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">{item.label}</td>
                    <td className="px-6 py-3 text-slate-600">{formatDate(item.date)}</td>
                    <td className="px-6 py-3">{categoryBadge(item.category)}</td>
                    <td className="px-6 py-3">
                      {item.isHighlighted ? (
                        <Badge variant="warning">Highlighted</Badge>
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
        title={modal.data ? 'Edit Date' : 'Add Date'}
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
          <Select
            label="Edition"
            name="edition"
            register={register}
            error={errors.edition?.message}
            options={editionOptions}
            required
          />
          <Input
            label="Label"
            name="label"
            register={register}
            error={errors.label?.message}
            placeholder="e.g. Abstract Submission Deadline"
            required
          />
          <Input
            label="Date"
            name="date"
            type="date"
            register={register}
            error={errors.date?.message}
            required
          />
          <Select
            label="Category"
            name="category"
            register={register}
            error={errors.category?.message}
            options={categoryOptions}
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
              {...register('isHighlighted')}
            />
            Highlight this date
          </label>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Date"
        message="Are you sure you want to delete this important date?"
        loading={deleting}
      />
    </div>
  );
}
