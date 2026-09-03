import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <style>{`
        @keyframes login-float-1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(3deg)} }
        @keyframes login-float-2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(16px) rotate(-2deg)} }
        @keyframes login-float-3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(8px,-12px)} 66%{transform:translate(-6px,8px)} }
        @keyframes login-spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes login-fade-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes login-scan    { 0%{top:-30%} 100%{top:130%} }
        @keyframes login-pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(13,148,136,0.3)} 50%{box-shadow:0 0 40px rgba(13,148,136,0.6)} }
        .login-panel-animate { animation: login-fade-up 0.6s ease both; }
        .login-panel-animate:nth-child(1) { animation-delay: 0.1s; }
        .login-panel-animate:nth-child(2) { animation-delay: 0.2s; }
        .login-panel-animate:nth-child(3) { animation-delay: 0.3s; }
        .login-panel-animate:nth-child(4) { animation-delay: 0.4s; }
        .login-panel-animate:nth-child(5) { animation-delay: 0.5s; }
        .login-input:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 3px rgba(13,148,136,0.15); }
        .login-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .login-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(13,148,136,0.4); }
        .login-btn:not(:disabled):active { transform: translateY(0); }
      `}</style>

      <div className="min-h-screen flex bg-slate-950">

        {/* Left decorative panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
          style={{ background: 'linear-gradient(135deg, #020617 0%, #0f172a 50%, #030d1a 100%)' }}>

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(white 1px,transparent 1px),linear-gradient(90deg,white 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          {/* Orbs */}
          <div className="absolute" style={{
            top:'10%', left:'5%', width:320, height:320, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)',
            animation:'login-float-1 8s ease-in-out infinite',
          }} />
          <div className="absolute" style={{
            bottom:'10%', right:'5%', width:260, height:260, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            animation:'login-float-2 10s ease-in-out infinite',
          }} />
          <div className="absolute" style={{
            top:'45%', right:'20%', width:120, height:120, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)',
            animation:'login-float-3 12s ease-in-out infinite',
          }} />

          {/* Scan line */}
          <div className="absolute left-0 right-0" style={{
            height:1,
            background:'linear-gradient(90deg,transparent,rgba(13,148,136,0.5),transparent)',
            animation:'login-scan 5s linear infinite',
          }} />

          {/* Rotating ring */}
          <div className="absolute" style={{
            top:'15%', right:'12%', width:140, height:140,
            border:'1px solid rgba(13,148,136,0.2)', borderRadius:'50%',
            animation:'login-spin 18s linear infinite',
          }}>
            <div style={{
              position:'absolute', top:-4, left:'50%', marginLeft:-4,
              width:8, height:8, borderRadius:'50%',
              background:'#0d9488', boxShadow:'0 0 10px #0d9488',
            }} />
          </div>
          <div className="absolute" style={{
            bottom:'18%', left:'10%', width:80, height:80,
            border:'1px solid rgba(13,148,136,0.15)', borderRadius:'50%',
            animation:'login-spin 12s linear infinite reverse',
          }} />

          {/* Left edge accent */}
          <div className="absolute left-0 top-0 bottom-0 w-px" style={{
            background:'linear-gradient(to bottom,transparent,#0d9488,transparent)',
          }} />

          {/* Content */}
          <div className="relative z-10 text-center max-w-sm">
            {/* Logo icon */}
            <div className="mx-auto mb-8 w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background:'linear-gradient(135deg,#0f766e,#0d9488)',
                boxShadow:'0 0 40px rgba(13,148,136,0.4)',
                animation:'login-pulse-glow 3s ease-in-out infinite',
              }}>
              <Shield size={36} color="#fff" strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
              Admin Portal
            </h2>
            <div className="w-12 h-0.5 mx-auto mb-5" style={{ background:'#0d9488' }} />
            <p className="text-slate-400 text-sm leading-relaxed">
              Secure access to the Aging Congress content management system.
              Manage speakers, sessions, registrations, and more.
            </p>

            {/* Features list */}
            <div className="mt-10 space-y-3 text-left">
              {[
                'Speaker & committee management',
                'Session scheduling & program',
                'Registration & abstracts',
                'Real-time site theme control',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background:'rgba(13,148,136,0.15)', border:'1px solid rgba(13,148,136,0.3)' }}>
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-slate-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10"
          style={{ background:'#0f172a' }}>

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0f766e,#0d9488)' }}>
                <Shield size={20} color="#fff" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Admin Portal</p>
                <p className="text-xs text-slate-500">Aging Congress CMS</p>
              </div>
            </div>

            {/* Heading */}
            <div className="login-panel-animate mb-8">
              <h1 className="text-2xl font-black text-white mb-1">Welcome back</h1>
              <p className="text-slate-500 text-sm">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* Email */}
              <div className="login-panel-animate">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="admin@smscongress.com"
                    {...register('email', { required: 'Email is required' })}
                    className="login-input w-full h-12 pl-11 pr-4 rounded-xl text-sm text-white placeholder-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: errors.email ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="login-panel-animate">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="login-input w-full h-12 pl-11 pr-12 rounded-xl text-sm text-white placeholder-slate-600 transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: errors.password ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>}
              </div>

              {/* Forgot */}
              <div className="login-panel-animate text-right">
                <Link to="/forgot-password" className="text-xs font-semibold transition-colors"
                  style={{ color:'#0d9488' }}
                  onMouseEnter={e => e.currentTarget.style.color='#14b8a6'}
                  onMouseLeave={e => e.currentTarget.style.color='#0d9488'}>
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <div className="login-panel-animate">
                <button
                  type="submit"
                  disabled={loading}
                  className="login-btn w-full h-12 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background:'linear-gradient(135deg,#0f766e,#0d9488)' }}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="login-panel-animate mt-8 pt-6 border-t border-white/5">
              <p className="text-center text-xs text-slate-600">
                Aging Congress CMS · Secure Admin Portal
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
