export default function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div
      className={`${s} border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin ${className}`}
    />
  );
}
