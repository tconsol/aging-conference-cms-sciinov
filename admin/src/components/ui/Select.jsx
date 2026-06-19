export default function Select({
  label,
  name,
  register,
  error,
  options = [],
  placeholder = 'Select...',
  required,
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
      <select
        {...inputProps}
        {...props}
        className={`h-9 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-white ${
          error
            ? 'border-red-400 bg-red-50 focus:ring-red-400'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
