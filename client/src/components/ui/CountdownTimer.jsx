import { useState, useEffect } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function CountdownTimer({ targetDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (expired) return null;

  return (
    <div className={`flex items-center gap-3 sm:gap-4 ${className}`}>
      {[
        ['Days', timeLeft.days],
        ['Hours', timeLeft.hours],
        ['Mins', timeLeft.minutes],
        ['Secs', timeLeft.seconds],
      ].map(([label, val]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-white/5 border border-white/10 rounded-lg px-3 sm:px-5 py-2 sm:py-3 min-w-[58px] sm:min-w-[68px] text-center">
            <span className="text-2xl sm:text-3xl font-black text-white tabular-nums">
              {pad(val)}
            </span>
          </div>
          <span className="text-xs text-teal-400 mt-1.5 font-bold uppercase tracking-[0.15em]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
