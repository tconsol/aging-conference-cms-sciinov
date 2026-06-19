import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import RichTextEditor from '../../components/ui/RichTextEditor';
import Spinner from '../../components/ui/Spinner';
import { pagesAPI } from '../../api/content';
import { getErrorMessage } from '../../utils/helpers';

const PAGE_TITLES = {
  guidelines: 'Presentation Guidelines',
  publication: 'Publication Policy',
  terms: 'Terms & Conditions',
};

export default function StaticPageEditor() {
  const { key } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const pageTitle = PAGE_TITLES[key] || key;

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await pagesAPI.get(key);
      const data = res.data.data || res.data;
      reset({ title: data.title || pageTitle });
      setContent(data.content || '');
    } catch (err) {
      // Page might not exist yet start with defaults
      reset({ title: pageTitle });
      setContent('');
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
      await pagesAPI.update(key, {
        title: formData.title,
        content,
      });
      toast.success('Page saved successfully.');
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
        <RichTextEditor
          label="Page Content"
          value={content}
          onChange={setContent}
          placeholder="Write the page content here..."
        />
      </div>
    </div>
  );
}
