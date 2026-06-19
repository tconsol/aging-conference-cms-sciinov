import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { getErrorMessage } from '../../utils/helpers';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-teal-700 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
              <LayoutDashboard size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              {sent ? 'Check Your Email' : 'Forgot Password'}
            </h1>
            <p className="text-sm text-slate-500 mt-1 text-center">
              {sent
                ? 'If that email exists, a reset link has been sent.'
                : 'Enter your admin email to receive a reset link.'}
            </p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className={`w-full h-10 pl-9 pr-4 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Mail size={28} className="text-green-600" />
              </div>
              <p className="text-sm text-slate-600 text-center">
                Check your inbox and follow the link to reset your password. The link expires in 1 hour.
              </p>
            </div>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-6 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
