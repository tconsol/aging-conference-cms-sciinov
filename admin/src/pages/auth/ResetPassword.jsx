import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, LayoutDashboard, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/helpers';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, data.password);
      login(res.data.token, res.data.admin);
      toast.success('Password reset. Signed in.');
      navigate('/dashboard');
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
            <h1 className="text-2xl font-bold text-slate-800">Set New Password</h1>
            <p className="text-sm text-slate-500 mt-1">Choose a strong password.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  className={`w-full h-10 pl-9 pr-10 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (v) => v === watch('password') || 'Passwords do not match',
                  })}
                  className={`w-full h-10 pl-9 pr-4 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-teal-700 hover:bg-teal-800 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Reset Password
            </button>
          </form>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 mt-6">
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
