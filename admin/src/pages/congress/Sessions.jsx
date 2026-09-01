import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Dropdown from '../../components/ui/Dropdown';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import StatusToggle from '../../components/ui/StatusToggle';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { sessionsAPI, editionsAPI } from '../../api/congress';
import { getErrorMessage, getNextDisplayOrder, findDisplayOrderConflict } from '../../utils/helpers';

export default function Sessions() {
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEdition, setFilterEdition] = useState('');
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [orderConflict, setOrderConflict] = useState(null);

  const toggleStatus = async (item) => {
    try {
      setTogglingId(item._id);
      await sessionsAPI.update(item._id, { isActive: !item.isActive });
      setItems((prev) => prev.map((s) => s._id === item._id ? { ...s, isActive: !s.isActive } : s));
      toast.success('Status updated.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

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
      const res = await sessionsAPI.getAll(params);
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => { fetchItems(); }, [filterEdition]);

  const editionOptions = editions.map((e) => ({ value: e._id, label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})` }));

  const openModal = (data = null) => {
    if (data) {
      reset({
        title: data.title,
        description: data.description,
        edition: data.edition?._id || data.edition,
        icon: data.icon,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      });
    } else {
      reset({ isActive: true, displayOrder: getNextDisplayOrder(items) });
    }
    setModal({ open: true, data });
  };

  const executeSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (modal.data?._id) {
        await sessionsAPI.update(modal.data._id, formData);
        toast.success('Session updated successfully.');
      } else {
        await sessionsAPI.create(formData);
        toast.success('Session created successfully.');
      }
      setModal({ open: false, data: null });
      fetchItems();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (formData) => {
    if (!modal.data?._id) {
      const conflict = findDisplayOrderConflict(items, formData.displayOrder);
      if (conflict) { setOrderConflict({ pending: formData, conflict }); return; }
    }
    await executeSubmit(formData);
  };

  const handleReplaceOrder = async () => {
    const { pending, conflict } = orderConflict;
    setOrderConflict(null);
    const newLast = getNextDisplayOrder(items);
    try {
      await sessionsAPI.update(conflict._id, { displayOrder: newLast });
      setItems((prev) => prev.map((i) => i._id === conflict._id ? { ...i, displayOrder: newLast } : i));
    } catch {}
    await executeSubmit(pending);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await sessionsAPI.delete(deleteDialog.id);
      toast.success('Session deleted.');
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
        title="Scientific Sessions"
        subtitle="Manage session topics for the congress"
        action={() => openModal()}
        actionLabel="Add Session"
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
            message="No sessions found"
            description="Add scientific session topics for your congress."
            action={() => openModal()}
            actionLabel="Add Session"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Edition</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Display Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-6 py-3 text-slate-600">
                      {item.edition?.title ? `${item.edition.title} (${item.edition.year})` : ''}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{item.displayOrder ?? ''}</td>
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
        title={modal.data ? 'Edit Session' : 'Add Session'}
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
            label="Title"
            name="title"
            register={register}
            error={errors.title?.message}
            placeholder="e.g. Neuroscience of Aging"
            required
          />
          <Select
            label="Edition"
            name="edition"
            register={register}
            error={errors.edition?.message}
            options={editionOptions}
            required
            defaultValue={modal.data?.edition?._id || modal.data?.edition || ''}
          />
          <Textarea
            label="Description"
            name="description"
            register={register}
            error={errors.description?.message}
            rows={3}
          />
          <Input
            label="Icon"
            name="icon"
            register={register}
            error={errors.icon?.message}
            placeholder="e.g. brain"
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
            Active
          </label>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Session"
        message="Are you sure you want to delete this session? This action cannot be undone."
        loading={deleting}
      />
      <ConfirmDialog
        open={!!orderConflict}
        onClose={() => setOrderConflict(null)}
        onConfirm={handleReplaceOrder}
        title="Duplicate Display Order"
        message={`Display order ${orderConflict?.conflict?.displayOrder} is already used by "${orderConflict?.conflict?.title || 'another item'}". Proceeding will move that item to the end.`}
        confirmLabel="Replace"
      />
    </div>
  );
}
