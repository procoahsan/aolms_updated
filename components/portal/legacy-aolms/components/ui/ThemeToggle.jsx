'use client';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        relative w-14 h-8 rounded-full p-0.5 transition-all duration-500 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-electric/40
        ${isDark
          ? 'bg-navy-700 border border-white/10 shadow-inner shadow-black/30'
          : 'bg-gradient-to-r from-amber-light/30 to-amber/20 border border-amber/30 shadow-inner shadow-amber/10'
        }
      `}
    >
      {/* Track background stars/clouds */}
      <span
        className={`absolute inset-0 rounded-full overflow-hidden transition-opacity duration-500 ${isDark ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="absolute top-1.5 left-2 w-1 h-1 rounded-full bg-white/40" />
        <span className="absolute top-3.5 left-4 w-0.5 h-0.5 rounded-full bg-white/25" />
        <span className="absolute top-2 left-6 w-0.5 h-0.5 rounded-full bg-white/30" />
      </span>

      {/* Slider knob */}
      <span
        className={`
          relative flex items-center justify-center w-7 h-7 rounded-full
          transition-all duration-500 ease-in-out transform
          ${isDark
            ? 'translate-x-0 bg-gradient-to-br from-slate-300 to-slate-400 shadow-lg shadow-electric/20'
            : 'translate-x-6 bg-gradient-to-br from-amber to-amber-light shadow-lg shadow-amber/40'
          }
        `}
      >
        {/* Moon icon (dark mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute transition-all duration-500 ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-navy-900'
              : 'opacity-0 rotate-90 scale-50 text-navy-900'
          }`}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>

        {/* Sun icon (light mode) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute transition-all duration-500 ${
            isDark
              ? 'opacity-0 -rotate-90 scale-50 text-amber'
              : 'opacity-100 rotate-0 scale-100 text-white'
          }`}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>
    </button>
  );
}
