import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import { siteSettingsAPI } from '../../api/settings';
import { getErrorMessage } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';

const ICON_OPTIONS = [
  { value: 'BookOpen', label: 'Book / Research' },
  { value: 'Mic', label: 'Mic / Speaker' },
  { value: 'Users', label: 'Users / Networking' },
  { value: 'Award', label: 'Award / Recognition' },
  { value: 'Globe', label: 'Globe / International' },
  { value: 'FlaskConical', label: 'Flask / Science' },
  { value: 'Heart', label: 'Heart / Healthcare' },
  { value: 'Lightbulb', label: 'Lightbulb / Innovation' },
  { value: 'Calendar', label: 'Calendar / Events' },
  { value: 'Star', label: 'Star / Excellence' },
  { value: 'Stethoscope', label: 'Stethoscope / Medical' },
  { value: 'Cpu', label: 'Cpu / Technology' },
];

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-5 space-y-4">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

const DEFAULT_STATS = [
  { label: 'Attendees', value: '1,200+' },
  { label: 'Speakers', value: '60+' },
  { label: 'Countries', value: '45+' },
  { label: 'Sessions', value: '30+' },
];

const DEFAULT_FEATURES = [
  { icon: 'BookOpen', title: 'Research Sessions', desc: 'Cutting-edge presentations across all areas of geroscience' },
  { icon: 'Mic', title: 'Keynote Speakers', desc: 'Nobel laureates and leading researchers from top institutions' },
  { icon: 'Users', title: 'Global Networking', desc: 'Connect with peers from 45+ countries worldwide' },
  { icon: 'Award', title: 'Research Awards', desc: 'Recognizing excellence in aging research and innovation' },
];

export default function Homepage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      hero: {
        tagline: 'Registration Open',
        titleLine1: "The World's",
        titleLine2: 'Aging Science',
        titleLine3: 'congress.',
        subtitle: 'Join world-leading researchers, clinicians, and innovators shaping the future of healthy aging and longevity science.',
        ctaPrimaryLabel: 'Register Now',
        ctaPrimaryLink: '/registration',
        ctaSecondaryLabel: 'Submit Abstract',
        ctaSecondaryLink: '/abstract-submission',
        countdownLabel: 'Congress Begins In',
      },
      stats: DEFAULT_STATS,
      about: {
        sectionLabel: 'About the congress',
        title: 'Uniting Global Experts in Aging Research',
        subtitle: 'Our international congress brings together scientists, clinicians, and industry leaders to advance our understanding of aging biology.',
      },
      features: DEFAULT_FEATURES,
      cta: {
        label: "Don't Miss Out",
        title: 'Be Part of the Conversation',
        subtitle: 'Register now to secure your place at the world\'s leading congress on aging science and geroscience research.',
        primaryLabel: 'Register Now',
        primaryLink: '/registration',
        secondaryLabel: 'Submit Abstract',
        secondaryLink: '/abstract-submission',
      },
    },
  });

  const { fields: statFields, append: appendStat, remove: removeStat } = useFieldArray({ control, name: 'stats' });
  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control, name: 'features' });

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await siteSettingsAPI.get();
        const d = res.data?.data ?? res.data;
        const hp = d?.homepage;
        if (hp) {
          reset({
            hero: {
              tagline: hp.hero?.tagline ?? 'Registration Open',
              titleLine1: hp.hero?.titleLine1 ?? "The World's",
              titleLine2: hp.hero?.titleLine2 ?? 'Aging Science',
              titleLine3: hp.hero?.titleLine3 ?? 'congress.',
              subtitle: hp.hero?.subtitle ?? '',
              ctaPrimaryLabel: hp.hero?.ctaPrimaryLabel ?? 'Register Now',
              ctaPrimaryLink: hp.hero?.ctaPrimaryLink ?? '/registration',
              ctaSecondaryLabel: hp.hero?.ctaSecondaryLabel ?? 'Submit Abstract',
              ctaSecondaryLink: hp.hero?.ctaSecondaryLink ?? '/abstract-submission',
              countdownLabel: hp.hero?.countdownLabel ?? 'Congress Begins In',
            },
            stats: hp.stats?.length ? hp.stats : DEFAULT_STATS,
            about: {
              sectionLabel: hp.about?.sectionLabel ?? 'About the congress',
              title: hp.about?.title ?? 'Uniting Global Experts in Aging Research',
              subtitle: hp.about?.subtitle ?? '',
            },
            features: hp.features?.length ? hp.features : DEFAULT_FEATURES,
            cta: {
              label: hp.cta?.label ?? "Don't Miss Out",
              title: hp.cta?.title ?? 'Be Part of the Conversation',
              subtitle: hp.cta?.subtitle ?? '',
              primaryLabel: hp.cta?.primaryLabel ?? 'Register Now',
              primaryLink: hp.cta?.primaryLink ?? '/registration',
              secondaryLabel: hp.cta?.secondaryLabel ?? 'Submit Abstract',
              secondaryLink: hp.cta?.secondaryLink ?? '/abstract-submission',
            },
          });
        }
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [reset]);

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await siteSettingsAPI.updateHomepage(data);
      toast.success('Homepage settings saved.');
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
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LayoutTemplate size={20} className="text-teal-600" />
            Homepage CMS
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Edit all text and content on the public home page</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── HERO ── */}
        <SectionCard title="Hero Section">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Top Label Text"
              name="hero.tagline"
              register={register}
              error={errors.hero?.tagline?.message}
              placeholder="Registration Open"
            />
            <Input
              label="Countdown Label"
              name="hero.countdownLabel"
              register={register}
              error={errors.hero?.countdownLabel?.message}
              placeholder="Congress Begins In"
            />
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">Headline (3 lines, each on its own line)</p>
          <div className="space-y-2">
            <Input
              label="Title Line 1 (gray)"
              name="hero.titleLine1"
              register={register}
              placeholder="The World's"
            />
            <Input
              label="Title Line 2 (white)"
              name="hero.titleLine2"
              register={register}
              placeholder="Aging Science"
            />
            <Input
              label="Title Line 3 (teal accent)"
              name="hero.titleLine3"
              register={register}
              placeholder="congress."
            />
          </div>
          <Textarea
            label="Subtitle Paragraph"
            name="hero.subtitle"
            register={register}
            rows={3}
            placeholder="Join world-leading researchers..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary CTA Label"
              name="hero.ctaPrimaryLabel"
              register={register}
              placeholder="Register Now"
            />
            <Input
              label="Primary CTA Link"
              name="hero.ctaPrimaryLink"
              register={register}
              placeholder="/registration"
            />
            <Input
              label="Secondary CTA Label"
              name="hero.ctaSecondaryLabel"
              register={register}
              placeholder="Submit Abstract"
            />
            <Input
              label="Secondary CTA Link"
              name="hero.ctaSecondaryLink"
              register={register}
              placeholder="/abstract-submission"
            />
          </div>
        </SectionCard>

        {/* ── STATS ── */}
        <SectionCard title="Stats / Numbers Bar">
          <p className="text-xs text-slate-400">These appear in the teal stats bar and the hero stats grid.</p>
          <div className="space-y-2">
            {statFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2">
                <Input
                  name={`stats.${index}.value`}
                  register={register}
                  placeholder="1,200+"
                  label="Value"
                  className="w-32 shrink-0"
                />
                <Input
                  name={`stats.${index}.label`}
                  register={register}
                  placeholder="Attendees"
                  label="Label"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeStat(index)}
                  className="mb-0.5 p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendStat({ value: '', label: '' })}
          >
            <Plus size={14} /> Add Stat
          </Button>
        </SectionCard>

        {/* ── ABOUT ── */}
        <SectionCard title="About Section">
          <Input
            label="Section Label (small tag above title)"
            name="about.sectionLabel"
            register={register}
            placeholder="About the congress"
          />
          <Input
            label="Section Title"
            name="about.title"
            register={register}
            placeholder="Uniting Global Experts in Aging Research"
          />
          <Textarea
            label="Subtitle / Description"
            name="about.subtitle"
            register={register}
            rows={3}
            placeholder="Our international congress brings together..."
          />
        </SectionCard>

        {/* ── FEATURES ── */}
        <SectionCard title="Feature Cards (About Section)">
          <p className="text-xs text-slate-400">4 cards shown in the About section.</p>
          <div className="space-y-4">
            {featureFields.map((field, index) => (
              <div key={field.id} className="border border-slate-100 rounded-lg p-4 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="absolute top-3 right-3 p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <p className="text-xs font-semibold text-slate-500">Card {index + 1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Icon</label>
                    <select
                      {...register(`features.${index}.icon`)}
                      className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Title"
                    name={`features.${index}.title`}
                    register={register}
                    placeholder="Research Sessions"
                  />
                </div>
                <Textarea
                  label="Description"
                  name={`features.${index}.desc`}
                  register={register}
                  rows={2}
                  placeholder="Short description..."
                />
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => appendFeature({ icon: 'BookOpen', title: '', desc: '' })}
          >
            <Plus size={14} /> Add Feature Card
          </Button>
        </SectionCard>

        {/* ── CTA BANNER ── */}
        <SectionCard title="CTA Banner (Bottom Section)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Small Label Tag"
              name="cta.label"
              register={register}
              placeholder="Don't Miss Out"
            />
            <Input
              label="Heading"
              name="cta.title"
              register={register}
              placeholder="Be Part of the Conversation"
            />
          </div>
          <Textarea
            label="Subtitle"
            name="cta.subtitle"
            register={register}
            rows={2}
            placeholder="Register now to secure your place..."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Button Label"
              name="cta.primaryLabel"
              register={register}
              placeholder="Register Now"
            />
            <Input
              label="Primary Button Link"
              name="cta.primaryLink"
              register={register}
              placeholder="/registration"
            />
            <Input
              label="Secondary Button Label"
              name="cta.secondaryLabel"
              register={register}
              placeholder="Submit Abstract"
            />
            <Input
              label="Secondary Button Link"
              name="cta.secondaryLink"
              register={register}
              placeholder="/abstract-submission"
            />
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <Button type="submit" loading={saving} size="lg">
            <Save size={16} />
            Save Homepage
          </Button>
        </div>
      </form>
    </div>
  );
}
