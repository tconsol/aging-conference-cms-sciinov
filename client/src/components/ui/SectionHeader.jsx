export default function SectionHeader({ label, title, subtitle, centered = false, light = false }) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      {label && (
        <span
          className={`section-label ${
            centered
              ? 'inline-block border-l-0 pl-0 border-b-4 border-teal-500 pb-1 mx-auto'
              : ''
          } ${light ? '!text-teal-300 !border-teal-400' : ''}`}
        >
          {label}
        </span>
      )}
      <h2
        className={`text-3xl lg:text-4xl font-black leading-tight ${
          light ? 'text-white' : 'text-slate-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-lg leading-relaxed ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'} ${
            light ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
