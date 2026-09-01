import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Palette, RefreshCw, Eye, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { siteSettingsAPI } from '../../api/settings';
import { THEME_DEFAULTS as DEFAULTS, THEME_PRESETS as PRESETS } from '../../config/themePresets';
import { isAdminThemeEnabled, toggleAdminTheme } from '../../hooks/useAdminTheme';

function ColorField({ label, name, description, register, watch }) {
  const val = watch(name) || '#000000';
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
      <div className="relative shrink-0">
        <div
          className="w-12 h-12 rounded-xl shadow-inner border-2 border-white shadow-slate-300"
          style={{ backgroundColor: val }}
        />
        <input
          type="color"
          {...register(name)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-xl"
          title={label}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0 text-right">
        <code className="text-xs font-mono bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-700 uppercase">
          {val}
        </code>
      </div>
    </div>
  );
}

export default function Theme() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [adminTheme, setAdminTheme] = useState(() => isAdminThemeEnabled());

  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: DEFAULTS });

  const primary = watch('primaryColor') || DEFAULTS.primaryColor;
  const dark    = watch('primaryDark')  || DEFAULTS.primaryDark;
  const light   = watch('primaryLight') || DEFAULTS.primaryLight;
  const accent  = watch('accentColor')  || DEFAULTS.accentColor;

  useEffect(() => {
    siteSettingsAPI.get()
      .then((res) => {
        const theme = (res.data?.data ?? res.data)?.theme;
        if (theme) reset({ ...DEFAULTS, ...theme });
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [reset]);

  const handleAdminThemeToggle = (val) => {
    const current = watch();
    toggleAdminTheme(val, current);
    setAdminTheme(val);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await siteSettingsAPI.updateTheme(data);
      if (adminTheme) toggleAdminTheme(true, data);
      toast.success('Theme saved.');
    } catch {
      toast.error('Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <Palette size={20} className="text-teal-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900">Theme Colors</h1>
          <p className="text-sm text-slate-500 mt-0.5">Changes apply site-wide on client immediately after save.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-4">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Quick Presets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((preset) => {
                const active = watch('primaryColor') === preset.primaryColor;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => reset(preset)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                      active
                        ? 'border-slate-900 bg-slate-50 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex shrink-0">
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm -mr-1 z-10" style={{ backgroundColor: preset.primaryColor }} />
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: preset.accentColor }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{preset.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{preset.primaryColor}</p>
                    </div>
                    {active && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Fine-tune Colors</h2>
            <ColorField label="Primary Color" name="primaryColor" description="Main brand color buttons, links, accents" register={register} watch={watch} />
            <ColorField label="Primary Dark"  name="primaryDark"  description="Hover state for buttons and active elements" register={register} watch={watch} />
            <ColorField label="Primary Light" name="primaryLight" description="Subtle backgrounds, ghost button hover" register={register} watch={watch} />
            <ColorField label="Accent Color"  name="accentColor"  description="Highlights badges, featured tags, stars" register={register} watch={watch} />
          </div>

          {/* Admin panel theme toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Monitor size={15} className="text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Apply to admin panel</p>
                  <p className="text-xs text-slate-500 mt-0.5">Theme colors affect this admin UI too</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAdminThemeToggle(!adminTheme)}
                className="relative shrink-0"
                style={{ width: 44, height: 24 }}
                aria-pressed={adminTheme}
              >
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 12,
                  background: adminTheme ? 'var(--brand, #0d9488)' : '#e2e8f0',
                  transition: 'background 0.2s',
                }} />
                <div style={{
                  position: 'absolute', top: 3, left: adminTheme ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                }} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Theme
            </button>
            <button
              type="button"
              onClick={() => reset(DEFAULTS)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={14} />
              Reset to Defaults
            </button>
          </div>
        </form>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <Eye size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Primary Button</p>
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-colors"
                  style={{ backgroundColor: primary }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = dark}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = primary}
                >
                  Register Now
                </button>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Outline Button</p>
                <button
                  type="button"
                  className="px-5 py-2 rounded-lg text-sm font-semibold border-2 transition-colors"
                  style={{ borderColor: primary, color: primary, backgroundColor: 'transparent' }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = primary; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = primary; }}
                >
                  Learn More
                </button>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Section Label</p>
                <span className="text-xs font-bold uppercase tracking-[0.2em] border-l-4 pl-3 block" style={{ color: primary, borderColor: primary }}>
                  About the Congress
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Stats Bar</p>
                <div className="rounded-lg p-3 text-center" style={{ backgroundColor: primary }}>
                  <div className="text-xl font-black text-white">1,200+</div>
                  <div className="text-xs mt-0.5" style={{ color: `${light}cc` }}>Attendees</div>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Accent Badge</p>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${accent}20`, color: accent }}>
                  ★ Featured Speaker
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2">Link / Text</p>
                <a className="text-sm font-semibold" style={{ color: primary }}>View All Speakers →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
