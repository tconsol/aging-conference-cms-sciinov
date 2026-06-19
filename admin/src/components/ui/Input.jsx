export default function Input({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  required,
  hint,
  className = '',
  ...props
}) {
  const inputProps = register ? register(name, { required }) : {};

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        {...inputProps}
        {...props}
        className={`h-9 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      />
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
