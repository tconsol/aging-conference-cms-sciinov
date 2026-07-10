import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, Layers } from 'lucide-react';
import { faqTopicsAPI } from '../../api/inbox';
import { getErrorMessage } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

export default function FAQTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await faqTopicsAPI.getAll();
      setTopics(res.data.data || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    reset({
      name: '',
      subtitle: '',
      icon: '',
      displayOrder: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    reset({
      name: item.name || '',
      subtitle: item.subtitle || '',
      icon: item.icon || '',
      displayOrder: item.displayOrder ?? '',
      isActive: item.isActive ?? true,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const payload = {
        name: data.name,
        subtitle: data.subtitle || '',
        icon: data.icon || '',
        isActive: data.isActive,
        displayOrder: data.displayOrder !== '' ? Number(data.displayOrder) : undefined,
      };
      if (editingItem) {
        await faqTopicsAPI.update(editingItem._id, payload);
        toast.success('Topic updated successfully.');
      } else {
        await faqTopicsAPI.create(payload);
        toast.success('Topic added successfully.');
      }
      closeModal();
      fetchTopics();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await faqTopicsAPI.delete(deleteTarget._id);
      toast.success('Topic deleted.');
      setDeleteTarget(null);
      fetchTopics();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ Topics"
        subtitle="Manage the topic sections shown on the public Help & Support page"
        actionLabel="Add Topic"
        actionIcon={Plus}
        action={openAdd}
      />

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : topics.length === 0 ? (
          <EmptyState
            message="No FAQ topics yet"
            description="Add a topic (e.g. 'Submission & Registration') before adding FAQs under it."
            action={openAdd}
            actionLabel="Add Topic"
            icon={Layers}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtitle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Icon</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topics.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-3 text-slate-500 max-w-[240px] truncate">{item.subtitle || '—'}</td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-xs">{item.icon || '—'}</td>
                    <td className="px-6 py-3">
                      <Badge variant={item.isActive ? 'success' : 'default'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{item.displayOrder ?? '—'}</td>
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
        title={editingItem ? 'Edit Topic' : 'Add Topic'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="faq-topic-form" loading={saving}>
              {editingItem ? 'Save Changes' : 'Add Topic'}
            </Button>
          </>
        }
      >
        <form id="faq-topic-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            name="name"
            register={register}
            required="Name is required"
            error={errors.name?.message}
            placeholder="e.g. Submission & Registration"
          />
          <Textarea
            label="Subtitle"
            name="subtitle"
            register={register}
            error={errors.subtitle?.message}
            placeholder="e.g. Browse questions in this topic"
            rows={2}
          />
          <Input
            label="Icon"
            name="icon"
            register={register}
            error={errors.icon?.message}
            placeholder="e.g. clipboard-list, credit-card, help-circle"
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
              id="topicIsActive"
              {...register('isActive')}
              className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
            />
            <label htmlFor="topicIsActive" className="text-sm font-medium text-slate-700">
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
        title="Delete Topic"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? FAQs under this topic will no longer be grouped correctly.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
