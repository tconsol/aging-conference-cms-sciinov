import { Link } from 'react-router-dom';
import { usecongress } from '../../context/congressContext';

export default function PageHero({ title, subtitle, breadcrumb = [] }) {
  const { activeEdition } = usecongress();
  const kicker = activeEdition?.year ? `congress ${activeEdition.year}` : 'congress';

  return (
    <section className="relative bg-slate-950 pt-24 pb-16 overflow-hidden">
      {/* Fine grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Vertical accent line */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-600" />

      <div className="container-custom relative z-10">
        {breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-slate-400 text-sm mb-6 flex-wrap">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-600">/</span>}
                {b.href ? (
                  <Link to={b.href} className="hover:text-teal-400 transition-colors">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-white">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <span className="section-label !text-teal-400 !border-teal-500">{kicker}</span>
        <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">{title}</h1>
        <div className="w-20 h-1 bg-teal-500 mb-6" />
        {subtitle && (
          <p className="text-xl text-slate-300 max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
