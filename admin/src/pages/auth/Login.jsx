import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck,
  AlertCircle, Users, CalendarDays, Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

const HIGHLIGHTS = [
  { icon: Users, label: 'Speakers, committee & registrations' },
  { icon: CalendarDays, label: 'Sessions, program & abstracts' },
  { icon: Palette, label: 'Live theme & page visibility control' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      const { token, admin } = res.data || {};
      // A misconfigured API base URL returns the SPA's own index.html with a
      // 200, so a "successful" response is not proof of a real login payload.
      if (!token || !admin) {
        throw new Error('Unexpected response from the server. Check the admin API configuration.');
      }
      login(token, admin);
      toast.success(`Welcome back, ${admin.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Caps Lock silently breaks password entry more often than anything else on
  // this screen, so surface it instead of letting the attempt fail.
  const trackCaps = (e) => {
    if (typeof e.getModifierState === 'function') setCapsOn(e.getModifierState('CapsLock'));
  };

  return (
    <>
      <style>{`
        @keyframes lg-drift-a { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(70px,50px) scale(1.15)} }
        @keyframes lg-drift-b { 0%,100%{transform:translate(0,0) scale(1.1)} 50%{transform:translate(-60px,-40px) scale(0.95)} }
        @keyframes lg-rise    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lg-sheen   { 0%{background-position:180% 0} 100%{background-position:-60% 0} }
        @keyframes lg-ring    { 0%{opacity:.7;transform:scale(.9)} 100%{opacity:0;transform:scale(1.5)} }

        .lg-rise { animation: lg-rise .55s cubic-bezier(.22,1,.36,1) both; }

        .lg-aurora { position:absolute; border-radius:50%; filter:blur(80px); }
        .lg-aurora-a {
          width:520px; height:520px; top:-16%; left:-14%;
          background:radial-gradient(circle, color-mix(in srgb, var(--brand) 70%, transparent) 0%, transparent 70%);
          opacity:.45; animation:lg-drift-a 16s ease-in-out infinite;
        }
        .lg-aurora-b {
          width:460px; height:460px; bottom:-18%; right:-12%;
          background:radial-gradient(circle, color-mix(in srgb, var(--brand-dark) 85%, transparent) 0%, transparent 70%);
          opacity:.4; animation:lg-drift-b 20s ease-in-out infinite;
        }

        .lg-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
          background-size:56px 56px;
          -webkit-mask-image:radial-gradient(ellipse 75% 65% at 40% 45%, #000 10%, transparent 100%);
                  mask-image:radial-gradient(ellipse 75% 65% at 40% 45%, #000 10%, transparent 100%);
        }

        .lg-mark { position:relative; }
        .lg-mark-ring {
          position:absolute; inset:0; border-radius:20px;
          border:1px solid color-mix(in srgb, var(--brand) 55%, transparent);
          animation:lg-ring 3s cubic-bezier(.22,1,.36,1) infinite;
        }
        .lg-mark-ring:nth-of-type(2) { animation-delay:1.5s; }

        .lg-headline {
          background:linear-gradient(100deg,#fff 20%, color-mix(in srgb, var(--brand) 60%, white) 50%, #fff 80%);
          background-size:220% 100%;
          -webkit-background-clip:text; background-clip:text;
          color:transparent; -webkit-text-fill-color:transparent;
          animation:lg-sheen 5s linear infinite;
        }

        .lg-field {
          transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
        }
        .lg-field:focus {
          outline:none;
          border-color: var(--brand);
          box-shadow: 0 0 0 4px color-mix(in srgb, var(--brand) 14%, transparent);
          background:#fff;
        }
        .lg-field:focus + .lg-icon, .lg-field:focus ~ .lg-icon { color: var(--brand); }

        .lg-btn {
          background:linear-gradient(135deg, var(--brand-dark), var(--brand));
          box-shadow:0 6px 20px color-mix(in srgb, var(--brand) 32%, transparent);
          transition:transform .15s ease, box-shadow .2s ease, filter .15s ease;
        }
        .lg-btn:not(:disabled):hover {
          transform:translateY(-1px); filter:brightness(1.06);
          box-shadow:0 12px 30px color-mix(in srgb, var(--brand) 45%, transparent);
        }
        .lg-btn:not(:disabled):active { transform:translateY(0); }
        .lg-btn .lg-arrow { transition:transform .2s ease; }
        .lg-btn:not(:disabled):hover .lg-arrow { transform:translateX(4px); }

        @media (prefers-reduced-motion: reduce) {
          .lg-rise, .lg-aurora, .lg-mark-ring, .lg-headline { animation:none !important; }
        }
      `}</style>

      <div className="min-h-screen flex bg-white">

        {/* ── Left: brand panel ── */}
        <div
          className="hidden lg:flex lg:w-[46%] xl:w-1/2 relative overflow-hidden flex-col justify-between p-12 xl:p-16"
          style={{ background: 'linear-gradient(150deg,#04070d 0%,#0b1220 55%,#050b14 100%)' }}
        >
          <div className="lg-aurora lg-aurora-a" />
          <div className="lg-aurora lg-aurora-b" />
          <div className="lg-grid" />

          {/* Brand mark */}
          <div className="relative z-10 lg-rise">
            <div className="lg-mark inline-flex">
              <span className="lg-mark-ring" />
              <span className="lg-mark-ring" />
              <div
                className="w-14 h-14 rounded-[20px] flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, color-mix(in srgb, var(--brand) 30%, transparent), rgba(255,255,255,.05))',
                  border: '1px solid color-mix(in srgb, var(--brand) 45%, transparent)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 30px color-mix(in srgb, var(--brand) 30%, transparent)',
                }}
              >
                <ShieldCheck size={24} color="#fff" strokeWidth={1.75} />
              </div>
            </div>
          </div>

          {/* Statement */}
          <div className="relative z-10 max-w-md">
            <p
              className="text-[10.5px] font-bold uppercase tracking-[0.28em] mb-5 lg-rise"
              style={{ color: 'color-mix(in srgb, var(--brand) 75%, white)', animationDelay: '.1s' }}
            >
              Aging Congress CMS
            </p>
            <h2
              className="lg-headline text-[2.6rem] xl:text-[3rem] font-black leading-[1.05] tracking-tight mb-6 lg-rise"
              style={{ animationDelay: '.18s' }}
            >
              Run the congress<br />from one place.
            </h2>
            <p
              className="text-slate-400 text-[15px] leading-relaxed mb-10 lg-rise"
              style={{ animationDelay: '.26s' }}
            >
              Content, people, submissions and site settings — every part of the
              public site is managed from this panel.
            </p>

            <div className="space-y-3.5">
              {HIGHLIGHTS.map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className="flex items-center gap-3.5 lg-rise"
                  style={{ animationDelay: `${0.34 + i * 0.08}s` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: 'color-mix(in srgb, var(--brand) 14%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--brand) 28%, transparent)',
                    }}
                  >
                    <Icon size={14} style={{ color: 'color-mix(in srgb, var(--brand) 80%, white)' }} />
                  </div>
                  <span className="text-sm text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-600 lg-rise" style={{ animationDelay: '.6s' }}>
            Authorised personnel only · All activity is logged
          </p>
        </div>

        {/* ── Right: form ── */}
        <div className="w-full lg:w-[54%] xl:w-1/2 flex items-center justify-center px-6 py-12 sm:px-10 bg-slate-50">
          <div className="w-full max-w-[400px]">

            {/* Mobile brand */}
            <div className="lg:hidden flex items-center gap-3 mb-10 lg-rise">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))' }}
              >
                <ShieldCheck size={20} color="#fff" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900 leading-tight">Admin Portal</p>
                <p className="text-xs text-slate-500">Aging Congress CMS</p>
              </div>
            </div>

            <div className="mb-9 lg-rise" style={{ animationDelay: '.05s' }}>
              <h1 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight mb-2">
                Welcome back
              </h1>
              <p className="text-sm text-slate-500">
                Sign in to continue to the admin dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

              {/* Email */}
              <div className="lg-rise" style={{ animationDelay: '.12s' }}>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@congress.org"
                    {...register('email', { required: 'Email is required' })}
                    className="lg-field peer w-full h-[50px] pl-11 pr-4 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white"
                    style={{ border: `1px solid ${errors.email ? '#ef4444' : '#e2e8f0'}` }}
                  />
                  <Mail
                    size={16}
                    className="lg-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
                    <AlertCircle size={13} /> {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="lg-rise" style={{ animationDelay: '.19s' }}>
                <div className="flex items-baseline justify-between mb-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold hover:underline"
                    style={{ color: 'var(--brand)' }}
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    onKeyUp={trackCaps}
                    onKeyDown={trackCaps}
                    onBlur={() => setCapsOn(false)}
                    {...register('password', { required: 'Password is required' })}
                    className="lg-field peer w-full h-[50px] pl-11 pr-12 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-white"
                    style={{ border: `1px solid ${errors.password ? '#ef4444' : '#e2e8f0'}` }}
                  />
                  <Lock
                    size={16}
                    className="lg-icon absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 mt-2">
                    <AlertCircle size={13} /> {errors.password.message}
                  </p>
                )}
                {capsOn && !errors.password && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 mt-2">
                    <AlertCircle size={13} /> Caps Lock is on
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="lg-rise pt-1" style={{ animationDelay: '.26s' }}>
                <button
                  type="submit"
                  disabled={loading}
                  className="lg-btn w-full h-[50px] rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight size={16} className="lg-arrow" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200 lg-rise" style={{ animationDelay: '.34s' }}>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock size={11} /> Secure session · Aging Congress CMS
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
