'use client';
import { useEffect, useState } from 'react';

export default function StatsCard({ label, value, icon, color = 'electric', delay = 0, onClick }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        current += Math.ceil(value / steps);
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(current);
        }
      }, stepDuration);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const gradientMap = {
    electric: 'from-electric/20 to-electric/5',
    emerald: 'from-emerald/20 to-emerald/5',
    amber: 'from-amber/20 to-amber/5',
    rose: 'from-rose/20 to-rose/5',
    purple: 'from-purple/20 to-purple/5',
    cyan: 'from-cyan/20 to-cyan/5',
  };

  const iconBgMap = {
    electric: 'bg-electric/15 text-electric-light',
    emerald: 'bg-emerald/15 text-emerald-light',
    amber: 'bg-amber/15 text-amber-light',
    rose: 'bg-rose/15 text-rose-light',
    purple: 'bg-purple/15 text-purple-light',
    cyan: 'bg-cyan/15 text-cyan-light',
  };

  const textColorMap = {
    electric: 'text-electric-light',
    emerald: 'text-emerald-light',
    amber: 'text-amber-light',
    rose: 'text-rose-light',
    purple: 'text-purple-light',
    cyan: 'text-cyan-light',
  };

  return (
    <div
      className={`glass-card p-5 bg-gradient-to-br ${gradientMap[color]} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 ${onClick ? 'cursor-pointer' : 'cursor-default'} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${textColorMap[color]} animate-count-up`}>
            {displayValue}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${iconBgMap[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
