import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  to,
  onClick,
  disabled,
  loading,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-teal-700 hover:bg-teal-800 text-white',
    secondary: 'border-2 border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white bg-transparent',
    outline: 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white bg-transparent',
    ghost: 'bg-transparent hover:bg-teal-50 text-teal-700',
    white: 'bg-white text-slate-900 hover:bg-stone-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-2.5 text-sm rounded-lg',
    lg: 'px-8 py-3 text-base rounded-lg',
    xl: 'px-10 py-4 text-lg rounded-lg',
  };

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={cls} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls} {...props}>
      {loading ? (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
