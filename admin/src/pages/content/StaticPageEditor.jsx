import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/ui/ImageUpload';
import RichTextEditor from '../../components/ui/RichTextEditor';
import AboutSectionsEditor from '../../components/ui/AboutSectionsEditor';
import Spinner from '../../components/ui/Spinner';
import { pagesAPI } from '../../api/content';
import { buildFormData, getErrorMessage } from '../../utils/helpers';

const PAGE_TITLES = {
  about: 'About',
  guidelines: 'Presentation Guidelines',
  publication: 'Publication Policy',
  terms: 'Terms & Conditions',
};

// Only the About page renders a subtitle and an illustration on the public site,
// so the extra fields are offered there rather than on every static page.
const PAGES_WITH_MEDIA = ['about'];

export default function StaticPageEditor() {
  const { key } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [currentImage, setCurrentImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const pageTitle = PAGE_TITLES[key] || key;
  const supportsMedia = PAGES_WITH_MEDIA.includes(key);

  const fetchPage = async () => {
    setLoading(true);
    setRemoveImage(false);
    try {
      const res = await pagesAPI.get(key);
      const data = res.data.data || res.data;
      reset({ title: data.title || pageTitle, subtitle: data.subtitle || '' });
      setContent(data.content || '');
      setCurrentImage(data.image || null);
    } catch {
      // Page might not exist yet start with defaults
      reset({ title: pageTitle, subtitle: '' });
      setContent('');
      setCurrentImage(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [key]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || '',
        content,
      };

      const files = formData.image;
      const picked = files instanceof FileList ? files[0] : (files instanceof File ? files : null);
      if (picked) payload.image = picked;
      // Only meaningful when no replacement was chosen: tells the server to drop
      // the stored image rather than leave it untouched.
      else if (removeImage) payload.removeImage = 'true';

      await pagesAPI.update(key, buildFormData(payload));
      toast.success('Page saved successfully.');
      fetchPage();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{pageTitle}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Edit the static page content</p>
        </div>
        <Button onClick={handleSubmit(onSubmit)} loading={saving}>
          <Save size={15} />
          Save Page
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
        <Input
          label="Page Title"
          name="title"
          register={register}
          error={errors.title?.message}
          placeholder="Page title..."
          required
        />

        {supportsMedia && (
          <>
            <Input
              label="Subtitle"
              name="subtitle"
              register={register}
              error={errors.subtitle?.message}
              placeholder="Short intro shown under the headline..."
              hint="Appears as the lead paragraph on the public About page."
            />

            <div>
              <ImageUpload
                label="Page Image"
                name="image"
                register={register}
                watch={watch}
                currentImage={removeImage ? null : currentImage}
                error={errors.image?.message}
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Shown beside the mission text on the public About page.
              </p>
              {currentImage && !removeImage && (
                <button
                  type="button"
                  onClick={() => setRemoveImage(true)}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700"
                >
                  <Trash2 size={13} /> Remove image on save
                </button>
              )}
              {removeImage && (
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-xs text-red-600 font-semibold">
                    Image will be removed when you save.
                  </span>
                  <button
                    type="button"
                    onClick={() => setRemoveImage(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <RichTextEditor
          label="Page Content"
          value={content}
          onChange={setContent}
          placeholder="Write the page content here..."
        />
      </div>

      {/* Saved separately from the copy above — different endpoint, and the
          sections are long enough that one giant save button would be worse. */}
      {supportsMedia && (
        <div className="mt-8">
          <AboutSectionsEditor />
        </div>
      )}
    </div>
  );
}
