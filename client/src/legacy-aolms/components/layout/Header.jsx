import ThemeToggle from '../ui/ThemeToggle';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ onUploadClick, title = "Staff Management", subtitle = "— here's your team overview" }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-slate-400 text-sm mt-1">{greeting} {subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          id="upload-excel-btn"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-electric to-electric-dark text-white text-sm font-medium hover:shadow-lg hover:shadow-electric/25 transition-all duration-300 hover:scale-105 active:scale-95"
          style={isDark ? {} : { color: '#ffffff' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload Excel
        </button>

        {/* Date Badge */}
        <div className="glass-card px-4 py-2.5 text-sm text-slate-300">
          {now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </header>
  );
}
