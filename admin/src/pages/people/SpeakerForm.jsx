import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import Spinner from '../../components/ui/Spinner';
import { speakersAPI } from '../../api/people';
import { editionsAPI } from '../../api/congress';
import { buildFormData, getErrorMessage } from '../../utils/helpers';

export default function SpeakerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [selectedEditions, setSelectedEditions] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const fetchEditions = async () => {
    try {
      const res = await editionsAPI.getAll();
      setEditions(res.data.data || []);
    } catch {
      toast.error('Failed to load editions.');
    }
  };

  const fetchSpeaker = async () => {
    try {
      setLoading(true);
      const res = await speakersAPI.getOne(id);
      const speaker = res.data.data;
      reset({
        fullName: speaker.fullName,
        designation: speaker.designation,
        organization: speaker.organization,
        country: speaker.country,
        biography: speaker.biography,
        isFeatured: speaker.isFeatured,
        isActive: speaker.isActive,
        displayOrder: speaker.displayOrder,
      });
      if (speaker.photo) setCurrentPhoto(speaker.photo);
      const editionIds = (speaker.editions || []).map((e) => (typeof e === 'object' ? e._id : e));
      setSelectedEditions(editionIds);
    } catch {
      toast.error('Failed to load speaker.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEditions(); }, []);
  useEffect(() => {
    if (isEdit) fetchSpeaker();
  }, [id]);

  const toggleEdition = (editionId) => {
    setSelectedEditions((prev) =>
      prev.includes(editionId)
        ? prev.filter((e) => e !== editionId)
        : [...prev, editionId]
    );
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        editions: selectedEditions,
      };
      const fd = buildFormData(payload);

      if (isEdit) {
        await speakersAPI.update(id, fd);
        toast.success('Speaker updated successfully.');
      } else {
        await speakersAPI.create(fd);
        toast.success('Speaker created successfully.');
      }
      navigate('/speakers');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/speakers')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {isEdit ? 'Edit Speaker' : 'Add Speaker'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEdit ? 'Update speaker information' : 'Add a new speaker to the congress'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Basic info card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input
                  label="Full Name"
                  name="fullName"
                  register={register}
                  error={errors.fullName?.message}
                  placeholder="e.g. Dr. Jane Smith"
                  required
                />
              </div>
              <Input
                label="Designation"
                name="designation"
                register={register}
                error={errors.designation?.message}
                placeholder="e.g. Professor of Gerontology"
              />
              <Input
                label="Organization"
                name="organization"
                register={register}
                error={errors.organization?.message}
                placeholder="e.g. Harvard Medical School"
              />
              <Input
                label="Country"
                name="country"
                register={register}
                error={errors.country?.message}
                placeholder="e.g. United States"
              />
              <Input
                label="Display Order"
                name="displayOrder"
                type="number"
                register={register}
                error={errors.displayOrder?.message}
              />
              <div className="col-span-2">
                <Textarea
                  label="Biography"
                  name="biography"
                  register={register}
                  error={errors.biography?.message}
                  rows={6}
                />
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Photo</h2>
            <div className="max-w-xs">
              <ImageUpload
                label="Speaker Photo"
                name="photo"
                register={register}
                watch={watch}
                error={errors.photo?.message}
                currentImage={currentPhoto}
              />
            </div>
          </div>

          {/* Editions */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">congress Editions</h2>
            {editions.length === 0 ? (
              <p className="text-sm text-slate-400">No editions available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {editions.map((edition) => (
                  <label
                    key={edition._id}
                    className="flex items-center gap-2.5 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEditions.includes(edition._id)}
                      onChange={() => toggleEdition(edition._id)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-700 font-medium">
                      {edition.title} ({edition.year})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Settings</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  {...register('isFeatured')}
                />
                Featured speaker
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                  {...register('isActive')}
                />
                Active (visible on website)
              </label>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button variant="secondary" type="button" onClick={() => navigate('/speakers')}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : null}
              {isEdit ? 'Update Speaker' : 'Add Speaker'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
