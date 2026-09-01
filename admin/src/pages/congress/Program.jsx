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
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { programAPI, editionsAPI } from '../../api/congress';
import { speakersAPI } from '../../api/people';
import { getErrorMessage } from '../../utils/helpers';

// Defaults only admins can add their own types, which are then remembered
// because they come back with the saved slots.
const DEFAULT_TYPE_OPTIONS = [
  { value: 'keynote', label: 'Keynote' },
  { value: 'plenary', label: 'Plenary' },
  { value: 'scientific', label: 'Scientific Session' },
  { value: 'coffee_break', label: 'Coffee Break' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'opening', label: 'Opening Ceremony' },
  { value: 'closing', label: 'Closing Ceremony' },
  { value: 'other', label: 'Other' },
];

const ADD_NEW_TYPE = '__add_new_type__';

// "poster_session" -> "Poster Session"
const humanizeType = (value) =>
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

// Free text -> a stable slug we can store and match on
const slugifyType = (text) =>
  String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const typeBadgeVariant = {
  keynote: 'purple',
  plenary: 'info',
  scientific: 'teal',
  coffee_break: 'warning',
  lunch: 'success',
  workshop: 'info',
  opening: 'info',
  closing: 'info',
  other: 'default',
};

const typeLabel = {
  keynote: 'Keynote',
  plenary: 'Plenary',
  scientific: 'Scientific',
  coffee_break: 'Coffee Break',
  lunch: 'Lunch',
  workshop: 'Workshop',
  opening: 'Opening',
  closing: 'Closing',
  other: 'Other',
};


export default function Program() {
  const [items, setItems] = useState([]);
  const [editions, setEditions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEdition, setFilterEdition] = useState('');
  const [activeDay, setActiveDay] = useState('1');
  const [modal, setModal] = useState({ open: false, data: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const watchedType = watch('type');

  const fetchDependencies = async () => {
    try {
      const [edRes, spRes] = await Promise.all([
        editionsAPI.getAll(),
        speakersAPI.getAll(),
      ]);
      setEditions(edRes.data.data || []);
      setSpeakers(spRes.data.data || []);
    } catch {
      toast.error('Failed to load editions/speakers.');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = filterEdition ? { edition: filterEdition } : {};
      const res = await programAPI.getAll(params);
      setItems(res.data.data || []);
    } catch {
      toast.error('Failed to load program slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDependencies(); }, []);
  useEffect(() => { fetchItems(); }, [filterEdition]);

  const editionOptions = editions.map((e) => ({ value: e._id, label: String(e.title).includes(String(e.year)) ? e.title : `${e.title} (${e.year})` }));
  const speakerOptions = [
    { value: '', label: 'No speaker' },
    ...speakers.map((s) => ({ value: s._id, label: s.fullName })),
  ];

  const filteredItems = items.filter((item) => String(item.day) === activeDay);

  // Days present in the data, plus one more so a new day can always be added
  const usedDays = [...new Set(items.map((i) => Number(i.day)).filter(Boolean))].sort((a, b) => a - b);
  const maxDay = usedDays.length ? Math.max(...usedDays) : 0;
  const dayTabs = (usedDays.length ? usedDays : [1]).map(String);
  const dayOptions = Array.from({ length: Math.max(maxDay, 1) + 1 }, (_, i) => {
    const d = i + 1;
    return { value: String(d), label: d > maxDay ? `Day ${d} (new)` : `Day ${d}` };
  });

  // Defaults + any custom types already saved, then the "add new" affordance
  const typeOptions = (() => {
    const known = new Set(DEFAULT_TYPE_OPTIONS.map((o) => o.value));
    const custom = [...new Set(items.map((i) => i.type).filter((t) => t && !known.has(t)))]
      .map((t) => ({ value: t, label: humanizeType(t) }));
    return [...DEFAULT_TYPE_OPTIONS, ...custom, { value: ADD_NEW_TYPE, label: '＋ Add new type…' }];
  })();

  const openModal = (data = null) => {
    if (data) {
      reset({
        edition: data.edition?._id || data.edition,
        day: String(data.day),
        startTime: data.startTime,
        endTime: data.endTime,
        title: data.title,
        type: data.type,
        speaker: data.speaker?._id || data.speaker || '',
        description: data.description,
        room: data.room,
      });
    } else {
      reset({ day: activeDay });
    }
    setModal({ open: true, data });
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.speaker) delete payload.speaker;

      // Resolve the "add new type" choice into the typed-in value
      if (payload.type === ADD_NEW_TYPE) {
        const custom = slugifyType(payload.newType);
        if (!custom) {
          toast.error('Enter a name for the new slot type.');
          setSubmitting(false);
          return;
        }
        payload.type = custom;
      }
      delete payload.newType;
      if (modal.data?._id) {
        await programAPI.update(modal.data._id, payload);
        toast.success('Slot updated successfully.');
      } else {
        await programAPI.create(payload);
        toast.success('Slot created successfully.');
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
      await programAPI.delete(deleteDialog.id);
      toast.success('Slot deleted.');
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
        title="congress Program"
        subtitle="Build the schedule for each day"
        action={() => openModal()}
        actionLabel="Add Slot"
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Dropdown
          value={filterEdition}
          onChange={setFilterEdition}
          options={[{ value: '', label: 'All Editions' }, ...editionOptions]}
          className="w-56"
        />
      </div>

      {/* Day tabs grow with the schedule, plus a shortcut to start the next day */}
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {dayTabs.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeDay === day
                ? 'bg-teal-700 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Day {day}
          </button>
        ))}
        <button
          onClick={() => { setActiveDay(String(maxDay + 1)); openModal(); }}
          title={`Add the first slot for Day ${maxDay + 1}`}
          className="px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-slate-300 text-slate-500 hover:border-teal-400 hover:text-teal-700 transition-colors"
        >
          ＋ Day {maxDay + 1}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            message={`No slots for Day ${activeDay}`}
            description="Add program slots to build the schedule."
            action={() => openModal()}
            actionLabel="Add Slot"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Start</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">End</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Speaker</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-700 font-medium">{item.startTime || ''}</td>
                    <td className="px-6 py-3 text-slate-600">{item.endTime || ''}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{item.title}</td>
                    <td className="px-6 py-3">
                      <Badge variant={typeBadgeVariant[item.type] || 'default'}>
                        {typeLabel[item.type] || humanizeType(item.type)}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-slate-600">
                      {item.speaker?.fullName || ''}
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
        title={modal.data ? 'Edit Program Slot' : 'Add Program Slot'}
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
            <Select
              label="Edition"
              name="edition"
              register={register}
              error={errors.edition?.message}
              options={editionOptions}
              required
              defaultValue={modal.data?.edition?._id || modal.data?.edition || ''}
            />
            <Select
              label="Day"
              name="day"
              register={register}
              error={errors.day?.message}
              options={dayOptions}
              required
              defaultValue={modal.data ? String(modal.data.day) : activeDay}
              hint={`Pick "Day ${maxDay + 1} (new)" to start another day`}
            />
            <Input
              label="Start Time"
              name="startTime"
              type="time"
              register={register}
              error={errors.startTime?.message}
            />
            <Input
              label="End Time"
              name="endTime"
              type="time"
              register={register}
              error={errors.endTime?.message}
            />
            <div className="col-span-2">
              <Input
                label="Title"
                name="title"
                register={register}
                error={errors.title?.message}
                placeholder="e.g. Opening Keynote Address"
                required
              />
            </div>
            <Select
              label="Type"
              name="type"
              register={register}
              error={errors.type?.message}
              options={typeOptions}
              required
              defaultValue={modal.data?.type || ''}
              hint="Not listed? Choose “＋ Add new type…”"
            />
            {watchedType === ADD_NEW_TYPE && (
              <div className="col-span-2">
                <Input
                  label="New Type Name"
                  name="newType"
                  register={register}
                  placeholder="e.g. Panel Discussion"
                  hint="Saved with this slot and offered in the list from then on."
                />
              </div>
            )}
            <Select
              label="Speaker"
              name="speaker"
              register={register}
              error={errors.speaker?.message}
              options={speakerOptions}
              defaultValue={modal.data?.speaker?._id || modal.data?.speaker || ''}
            />
            <Input
              label="Room"
              name="room"
              register={register}
              error={errors.room?.message}
              placeholder="e.g. Hall A"
            />
            <div className="col-span-2">
              <Textarea
                label="Description"
                name="description"
                register={register}
                error={errors.description?.message}
                rows={3}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Program Slot"
        message="Are you sure you want to delete this slot?"
        loading={deleting}
      />
    </div>
  );
}
