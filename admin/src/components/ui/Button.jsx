import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-500 border-transparent',
  secondary: 'bg-white text-slate-700 hover:bg-slate-50 focus:ring-teal-400 border-slate-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400 border-transparent',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-transparent',
  warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 border-transparent',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-sm gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border
        focus:outline-none focus:ring-2 focus:ring-offset-1
        transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
