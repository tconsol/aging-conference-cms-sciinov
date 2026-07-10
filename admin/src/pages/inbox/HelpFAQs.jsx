import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Plus, ChevronDown, ChevronUp, HelpCircle, Ticket } from 'lucide-react';
import { helpAPI, faqTopicsAPI } from '../../api/inbox';
import { truncate, getErrorMessage } from '../../utils/helpers';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';

function FAQCard({ item, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">
            {open ? (
              <ChevronUp size={16} className="text-slate-400" />
            ) : (
              <ChevronDown size={16} className="text-slate-400" />
            )}
          </div>
          {item.topic?.name && (
            <Badge variant="info" className="flex-shrink-0">
              {item.topic.name}
            </Badge>
          )}
          <span className="text-sm font-semibold text-slate-800 truncate">{item.question}</span>
          {!item.isActive && (
            <Badge variant="default" className="flex-shrink-0">
              Inactive
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-blue-50 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-slate-50">
          <p className="text-sm text-slate-600 leading-relaxed pt-3 whitespace-pre-wrap">{item.answer}</p>
          {item.displayOrder !== undefined && (
            <p className="text-xs text-slate-400 mt-2">Order: {item.displayOrder}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function HelpFAQs() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
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

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const res = await helpAPI.getAllFAQs();
      setFaqs(res.data.data || res.data.faqs || res.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await faqTopicsAPI.getAll();
      setTopics(res.data.data || res.data || []);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    fetchFAQs();
    fetchTopics();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    reset({
      topic: '',
      question: '',
      answer: '',
      displayOrder: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    reset({
      topic: item.topic?._id || item.topic || '',
      question: item.question || '',
      answer: item.answer || '',
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
        topic: data.topic || undefined,
        question: data.question,
        answer: data.answer,
        isActive: data.isActive,
        displayOrder: data.displayOrder !== '' ? Number(data.displayOrder) : undefined,
      };
      if (editingItem) {
        await helpAPI.updateFAQ(editingItem._id, payload);
        toast.success('FAQ updated successfully.');
      } else {
        await helpAPI.createFAQ(payload);
        toast.success('FAQ added successfully.');
      }
      closeModal();
      fetchFAQs();
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
      await helpAPI.deleteFAQ(deleteTarget._id);
      toast.success('FAQ deleted.');
      setDeleteTarget(null);
      fetchFAQs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`FAQs${!loading ? ` (${faqs.length})` : ''}`}
        subtitle="Manage frequently asked questions"
        actionLabel="Add FAQ"
        actionIcon={Plus}
        action={openAdd}
        secondaryLabel="Support Tickets"
        secondaryAction={() => navigate('/help/tickets')}
        secondaryIcon={Ticket}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <EmptyState
            message="No FAQs yet"
            description="Add frequently asked questions to help your attendees."
            action={openAdd}
            actionLabel="Add FAQ"
            icon={HelpCircle}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((item) => (
            <FAQCard
              key={item._id}
              item={item}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit FAQ' : 'Add FAQ'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="faq-form" loading={saving}>
              {editingItem ? 'Save Changes' : 'Add FAQ'}
            </Button>
          </>
        }
      >
        <form id="faq-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Topic"
            name="topic"
            register={register}
            required="Topic is required"
            error={errors.topic?.message}
            options={topics.map((t) => ({ value: t._id, label: t.name }))}
            placeholder="Select a topic..."
          />
          <Textarea
            label="Question"
            name="question"
            register={register}
            required="Question is required"
            error={errors.question?.message}
            placeholder="Enter the question..."
            rows={2}
          />
          <Textarea
            label="Answer"
            name="answer"
            register={register}
            required="Answer is required"
            error={errors.answer?.message}
            placeholder="Enter the answer..."
            rows={4}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Display Order"
              name="displayOrder"
              type="number"
              register={register}
              error={errors.displayOrder?.message}
              placeholder="0"
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <div className="flex items-center gap-3 h-9">
                <input
                  type="checkbox"
                  id="faqIsActive"
                  {...register('isActive')}
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                <label htmlFor="faqIsActive" className="text-sm text-slate-700">
                  Active
                </label>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete FAQ"
        message={`Are you sure you want to delete this FAQ? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
