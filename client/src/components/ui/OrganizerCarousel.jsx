import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrganizerCarousel({ organizers }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

  const total = organizers.length;
  const CARD_WIDTH = 280;
  const CARD_HEIGHT = 380;
  const VISIBLE = 2;

  const paginate = useCallback((dir) => {
    if (total === 0) return;
    setDirection(dir);
    setCurrentIndex((prev) => (prev + dir + total) % total);
  }, [total]);

  const goTo = (index) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const wrap = (index) => (index + total) % total;

  const getPosition = (index) => {
    const diff = wrap(index - currentIndex);
    if (diff === 0) return 'center';
    if (diff === 1) return 'right-1';
    if (diff === 2) return 'right-2';
    if (diff === total - 1) return 'left-1';
    if (diff === total - 2) return 'left-2';
    return 'hidden';
  };

  const ease = [0.25, 0.46, 0.45, 0.94];
  const duration = 0.6;

  const getStyles = (pos) => {
    switch (pos) {
      case 'center':
        return { zIndex: 10, opacity: 1, scale: 1.08, x: 0, filter: 'grayscale(0%)', pointerEvents: 'auto', transition: { duration, ease } };
      case 'right-1':
        return { zIndex: 5, opacity: 0.8, scale: 0.88, x: CARD_WIDTH * 0.72, filter: 'grayscale(80%)', pointerEvents: 'auto', transition: { duration, ease } };
      case 'right-2':
        return { zIndex: 2, opacity: 0.5, scale: 0.76, x: CARD_WIDTH * 1.38, filter: 'grayscale(100%)', pointerEvents: 'auto', transition: { duration, ease } };
      case 'left-1':
        return { zIndex: 5, opacity: 0.8, scale: 0.88, x: -CARD_WIDTH * 0.72, filter: 'grayscale(80%)', pointerEvents: 'auto', transition: { duration, ease } };
      case 'left-2':
        return { zIndex: 2, opacity: 0.5, scale: 0.76, x: -CARD_WIDTH * 1.38, filter: 'grayscale(100%)', pointerEvents: 'auto', transition: { duration, ease } };
      default:
        return { zIndex: 0, opacity: 0, scale: 0.7, x: direction > 0 ? CARD_WIDTH * 3 : -CARD_WIDTH * 3, pointerEvents: 'none', filter: 'grayscale(100%)', transition: { duration, ease } };
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [paginate]);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) paginate(diff > 0 ? 1 : -1);
  };

  const current = organizers[currentIndex];
  const initials = (name) => name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('') : 'O';

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full overflow-hidden py-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel track */}
      <div
        className="relative w-full max-w-5xl flex justify-center items-center"
        style={{ height: CARD_HEIGHT + 60, perspective: '1200px' }}
      >
        {/* Arrows wrapper div owns position so Framer inline transform doesn't fight -translate-y-1/2 */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
          <motion.button
            onClick={() => paginate(-1)}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </motion.button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
          <motion.button
            onClick={() => paginate(1)}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center hover:bg-teal-50 hover:border-teal-200 transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </motion.button>
        </div>

        {/* Cards */}
        <div className="relative w-full h-full flex justify-center items-center">
          <AnimatePresence initial={false} custom={direction}>
            {organizers.map((org, index) => {
              const pos = getPosition(index);
              const isCurrent = index === currentIndex;
              if (pos === 'hidden') return null;

              return (
                <motion.div
                  key={org._id}
                  className="absolute rounded-2xl overflow-hidden shadow-2xl cursor-pointer bg-white"
                  style={{
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    top: '50%',
                    left: '50%',
                    marginLeft: -CARD_WIDTH / 2,
                    marginTop: -CARD_HEIGHT / 2,
                  }}
                  initial={getStyles('hidden')}
                  animate={getStyles(pos)}
                  exit={getStyles('hidden')}
                  onClick={() => !isCurrent ? goTo(index) : undefined}
                >
                  {/* Photo */}
                  {org.photo ? (
                    <img
                      src={org.photo}
                      alt={org.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                      <span className="text-7xl font-bold text-white/90 select-none">
                        {initials(org.name)}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Name overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="font-bold text-sm leading-tight">{org.name}</p>
                    {org.designation && <p className="text-xs opacity-80 mt-0.5">{org.designation}</p>}
                  </div>

                  {/* Active ring */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-teal-400 ring-offset-2 ring-offset-white pointer-events-none" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Active member info */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current._id + '-info'}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="text-center mt-8 max-w-lg px-4"
          >
            <h2 className="text-2xl font-bold text-slate-900 relative inline-block">
              {current.name}
              <span className="block h-0.5 w-full bg-gradient-to-r from-teal-400 to-emerald-500 mt-2 rounded-full" />
            </h2>
            {current.designation && (
              <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mt-3">
                {current.designation}
              </p>
            )}
            {current.country && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <MapPin size={13} className="text-slate-400" />
                <span className="text-sm text-slate-400">{current.country}</span>
              </div>
            )}
            {current.bio && (
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">{current.bio}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dots */}
      <div className="flex justify-center gap-2.5 mt-8">
        {organizers.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => goTo(i)}
            whileTap={{ scale: 0.8 }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentIndex ? 24 : 10,
              height: 10,
              background: i === currentIndex
                ? 'linear-gradient(to right, #14b8a6, #10b981)'
                : '#cbd5e1',
            }}
          />
        ))}
      </div>
    </div>
  );
}
