const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 ${className}`}
    />
  );
}
