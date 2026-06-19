import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import { siteSettingsAPI } from '../../api/settings';
import { buildFormData, getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import ImageUpload from '../../components/ui/ImageUpload';
import Spinner from '../../components/ui/Spinner';

function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <h2 className="text-sm font-semibold text-slate-700 whitespace-nowrap">{title}</h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

export default function SiteSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLogo, setCurrentLogo] = useState(null);
  const [currentFavicon, setCurrentFavicon] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      siteName: '',
      tagline: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      footerText: '',
      linkedin: '',
      twitter: '',
      facebook: '',
      youtube: '',
      instagram: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await siteSettingsAPI.get();
        const d = res.data.data || res.data;
        setCurrentLogo(d.logo || null);
        setCurrentFavicon(d.favicon || null);
        reset({
          siteName: d.siteName || '',
          tagline: d.tagline || '',
          contactEmail: d.contactEmail || '',
          contactPhone: d.contactPhone || '',
          address: d.address || '',
          footerText: d.footerText || '',
          linkedin: d.socialLinks?.linkedin || '',
          twitter: d.socialLinks?.twitter || '',
          facebook: d.socialLinks?.facebook || '',
          youtube: d.socialLinks?.youtube || '',
          instagram: d.socialLinks?.instagram || '',
          seoTitle: d.seo?.title || '',
          seoDescription: d.seo?.description || '',
          seoKeywords: d.seo?.keywords || '',
        });
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      const socialLinks = {
        linkedin: data.linkedin || '',
        twitter: data.twitter || '',
        facebook: data.facebook || '',
        youtube: data.youtube || '',
        instagram: data.instagram || '',
      };

      const seo = {
        title: data.seoTitle || '',
        description: data.seoDescription || '',
        keywords: data.seoKeywords || '',
      };

      const payload = {
        siteName: data.siteName,
        tagline: data.tagline || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        footerText: data.footerText || '',
        socialLinks: JSON.stringify(socialLinks),
        seo: JSON.stringify(seo),
      };

      const logoFiles = data.logo;
      if (logoFiles instanceof FileList && logoFiles.length > 0) {
        payload.logo = logoFiles[0];
      } else if (logoFiles instanceof File) {
        payload.logo = logoFiles;
      }

      const faviconFiles = data.favicon;
      if (faviconFiles instanceof FileList && faviconFiles.length > 0) {
        payload.favicon = faviconFiles[0];
      } else if (faviconFiles instanceof File) {
        payload.favicon = faviconFiles;
      }

      const fd = buildFormData(payload);
      await siteSettingsAPI.update(fd);
      toast.success('Site settings saved successfully.');
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
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Site Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure your congress website settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-6">

          {/* General */}
          <SectionDivider title="General" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Site Name"
              name="siteName"
              register={register}
              required="Site name is required"
              error={errors.siteName?.message}
              placeholder="congress Name"
            />
            <Input
              label="Tagline"
              name="tagline"
              register={register}
              error={errors.tagline?.message}
              placeholder="Short tagline..."
            />
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              register={register}
              error={errors.contactEmail?.message}
              placeholder="info@example.com"
            />
            <Input
              label="Contact Phone"
              name="contactPhone"
              register={register}
              error={errors.contactPhone?.message}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div className="mt-4 space-y-4">
            <Textarea
              label="Address"
              name="address"
              register={register}
              error={errors.address?.message}
              placeholder="Full address..."
              rows={2}
            />
            <Input
              label="Footer Text"
              name="footerText"
              register={register}
              error={errors.footerText?.message}
              placeholder="© 2025 congress Name. All rights reserved."
            />
          </div>

          {/* Branding */}
          <SectionDivider title="Branding" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ImageUpload
              label="Logo"
              name="logo"
              register={register}
              watch={watch}
              currentImage={currentLogo}
              error={errors.logo?.message}
            />
            <ImageUpload
              label="Favicon"
              name="favicon"
              register={register}
              watch={watch}
              currentImage={currentFavicon}
              error={errors.favicon?.message}
            />
          </div>

          {/* Social Links */}
          <SectionDivider title="Social Links" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="LinkedIn"
              name="linkedin"
              register={register}
              error={errors.linkedin?.message}
              placeholder="https://linkedin.com/company/..."
            />
            <Input
              label="Twitter / X"
              name="twitter"
              register={register}
              error={errors.twitter?.message}
              placeholder="https://twitter.com/..."
            />
            <Input
              label="Facebook"
              name="facebook"
              register={register}
              error={errors.facebook?.message}
              placeholder="https://facebook.com/..."
            />
            <Input
              label="YouTube"
              name="youtube"
              register={register}
              error={errors.youtube?.message}
              placeholder="https://youtube.com/..."
            />
            <Input
              label="Instagram"
              name="instagram"
              register={register}
              error={errors.instagram?.message}
              placeholder="https://instagram.com/..."
            />
          </div>

          {/* SEO */}
          <SectionDivider title="SEO" />
          <div className="space-y-4">
            <Input
              label="Meta Title"
              name="seoTitle"
              register={register}
              error={errors.seoTitle?.message}
              placeholder="Page title for search engines"
            />
            <Textarea
              label="Meta Description"
              name="seoDescription"
              register={register}
              error={errors.seoDescription?.message}
              placeholder="Brief description for search engines (150–160 chars)"
              rows={3}
            />
            <Input
              label="Meta Keywords"
              name="seoKeywords"
              register={register}
              error={errors.seoKeywords?.message}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          {/* Save */}
          <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
            <Button type="submit" loading={saving} size="lg">
              <Save size={16} />
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
