'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useTheme } from '../../contexts/ThemeContext';

const emptyRange = { startDate: null, endDate: null };

function toStoredRange(range) {
  return {
    startDate: range?.startDate ? range.startDate.toISOString() : null,
    endDate: range?.endDate ? range.endDate.toISOString() : null,
  };
}

function fromStoredRange(value) {
  try {
    const parsed = JSON.parse(value);
    return {
      startDate: parsed.startDate ? new Date(parsed.startDate) : null,
      endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    };
  } catch {
    return emptyRange;
  }
}

function formatLabel(range) {
  if (!range?.startDate || !range?.endDate) return null;
  const fmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return `${fmt.format(range.startDate)} – ${fmt.format(range.endDate)}`;
}

export default function DateRangeFilter({
  value,
  onChange,
  storageKey,
  label = 'Date Range',
  disabled = false,
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [range, setRange] = useState(() => {
    if (value) return value;
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) return fromStoredRange(stored);
    }
    return emptyRange;
  });

  useEffect(() => {
    if (value) setRange(value);
  }, [value]);

  // Compute fixed position when opening
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      let top = rect.bottom + 8;
      let left = rect.left;
      // Clamp to viewport
      const pickerWidth = window.innerWidth < 768 ? 320 : 560;
      if (left + pickerWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - pickerWidth - 16);
      }
      if (top + 380 > window.innerHeight) {
        top = Math.max(8, rect.top - 380 - 8);
      }
      setDropdownPos({ top, left });
    }
  }, [open]);

  useEffect(() => {
    const onClick = (event) => {
      if (
        rootRef.current && !rootRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
        setClickCount(0);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const pickerRange = useMemo(() => ({
    startDate: range.startDate || new Date(),
    endDate: range.endDate || range.startDate || new Date(),
    key: 'selection',
  }), [range]);

  const emit = (next) => {
    setRange(next);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(toStoredRange(next)));
    onChange?.(next);
  };

  const handleSelect = ({ selection }) => {
    const startDate = selection.startDate || null;
    const endDate = selection.endDate || startDate;
    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Always update internal range so the picker shows the selection visually
    setRange({ startDate, endDate });

    // On second click (end date selected), emit the range and close
    if (newCount >= 2) {
      emit({ startDate, endDate });
      setClickCount(0);
      setTimeout(() => setOpen(false), 200);
    }
  };

  const clear = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    emit(emptyRange);
    setClickCount(0);
  };

  const hasValue = !!range.startDate && !!range.endDate;
  const dateLabel = formatLabel(range);

  return (
    <div ref={rootRef} className="relative" id="date-range-filter">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          ref={btnRef}
          type="button"
          disabled={disabled}
          onClick={() => { setOpen((v) => !v); setClickCount(0); }}
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
            hasValue
              ? isDark
                ? 'bg-blue-500/12 border-blue-500/30 text-blue-300 hover:bg-blue-500/18 shadow-sm shadow-blue-500/10'
                : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : isDark
                ? 'bg-white/[0.06] border-white/10 text-slate-300 hover:bg-white/[0.1] hover:border-white/20'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={label}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={hasValue ? (isDark ? 'text-blue-400' : 'text-blue-600') : ''}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="flex items-center gap-1.5">
            {!dateLabel && <span>{label}</span>}
            {dateLabel && <span className="font-semibold">{dateLabel}</span>}
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {hasValue && (
          <button
            type="button"
            onClick={clear}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
              isDark
                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title="Clear date filter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
      {open && createPortal(
        <div
          ref={dropdownRef}
          onMouseDown={(e) => e.stopPropagation()}
          className={`fixed rounded-2xl overflow-hidden max-w-[calc(100vw-2rem)] border transition-all duration-200 ${
            isDark
              ? 'border-white/10 bg-[#0f172a] shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]'
              : 'border-slate-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]'
          }`}
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 99999,
            animationName: 'fadeInUp',
            animationDuration: '0.25s',
            animationFillMode: 'forwards',
          }}
        >
          <DateRangePicker
            ranges={[pickerRange]}
            onChange={handleSelect}
            moveRangeOnFirstSelection={false}
            retainEndDateOnFirstSelection={true}
            months={window.innerWidth < 768 ? 1 : 2}
            direction={window.innerWidth < 768 ? 'vertical' : 'horizontal'}
            maxDate={new Date(2100, 11, 31)}
            rangeColors={['#3b82f6']}
            color="#3b82f6"
            staticRanges={[]}
            inputRanges={[]}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
