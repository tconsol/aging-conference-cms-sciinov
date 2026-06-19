import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import RichTextEditor from '../../components/ui/RichTextEditor';
import Spinner from '../../components/ui/Spinner';
import { newsAPI } from '../../api/content';
import { getErrorMessage } from '../../utils/helpers';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [currentImage, setCurrentImage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { status: 'draft' },
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetchArticle = async () => {
      setLoading(true);
      try {
        const res = await newsAPI.getOne(id);
        const data = res.data.data || res.data;
        reset({
          title: data.title || '',
          excerpt: data.excerpt || '',
          author: data.author || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
          status: data.status || 'draft',
        });
        setContent(data.content || '');
        setCurrentImage(data.featuredImage || '');
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, isEdit, reset]);

  const submitForm = async (formData, overrideStatus) => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('excerpt', formData.excerpt || '');
      fd.append('author', formData.author || '');
      fd.append('tags', formData.tags || '');
      fd.append('status', overrideStatus || formData.status);
      fd.append('content', content);

      const featuredImageFiles = formData.featuredImage;
      if (featuredImageFiles instanceof FileList && featuredImageFiles[0]) {
        fd.append('featuredImage', featuredImageFiles[0]);
      } else if (featuredImageFiles instanceof File) {
        fd.append('featuredImage', featuredImageFiles);
      }

      if (isEdit) {
        await newsAPI.update(id, fd);
        toast.success('Article updated successfully.');
      } else {
        await newsAPI.create(fd);
        toast.success('Article created successfully.');
      }
      navigate('/news');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = handleSubmit((data) => submitForm(data, 'draft'));
  const handlePublish = handleSubmit((data) => submitForm(data, 'published'));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/news')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to News
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">
          {isEdit ? 'Edit Article' : 'New Article'}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleSaveDraft} loading={saving}>
            <Save size={15} />
            Save as Draft
          </Button>
          <Button onClick={handlePublish} loading={saving}>
            Publish
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
            <Input
              label="Title"
              name="title"
              register={register}
              error={errors.title?.message}
              placeholder="Article title..."
              required
            />
            <Textarea
              label="Excerpt"
              name="excerpt"
              register={register}
              placeholder="Short summary of the article..."
              rows={3}
            />
            <div>
              <RichTextEditor
                label="Content"
                value={content}
                onChange={setContent}
                placeholder="Write your article content here..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
            <Select
              label="Status"
              name="status"
              register={register}
              options={statusOptions}
            />
            <Input
              label="Author"
              name="author"
              register={register}
              placeholder="Author name"
            />
            <Input
              label="Tags"
              name="tags"
              register={register}
              placeholder="tag1, tag2, tag3"
              hint="Comma-separated"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <ImageUpload
              label="Featured Image"
              name="featuredImage"
              register={register}
              watch={watch}
              currentImage={currentImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
