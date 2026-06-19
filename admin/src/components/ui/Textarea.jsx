export default function Textarea({
  label,
  name,
  register,
  error,
  placeholder,
  required,
  rows = 4,
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
      <textarea
        rows={rows}
        placeholder={placeholder}
        {...inputProps}
        {...props}
        className={`px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
