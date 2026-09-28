'use client';
import { useState, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const SortIcon = ({ direction }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="inline-block ml-1 flex-shrink-0"
  >
    {direction === 'asc' ? (
      <polyline points="18 15 12 9 6 15" />
    ) : direction === 'desc' ? (
      <polyline points="6 9 12 15 18 9" />
    ) : (
      <>
        <polyline points="8 7 12 3 16 7" opacity="0.4" />
        <polyline points="8 17 12 21 16 17" opacity="0.4" />
      </>
    )}
  </svg>
);

export default function OntCheckTable({ data, loading, onCheckClick }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      if (prev.direction === 'desc') return { key: null, direction: null };
      return { key, direction: 'asc' };
    });
  };

  const filteredData = useMemo(() => {
    if (!data?.length) return data;
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(r =>
      r.serialNumber.toLowerCase().includes(term) ||
      r.poNumber.toLowerCase().includes(term) ||
      r.ontName.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!filteredData?.length || !sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const { key, direction } = sortConfig;
      const aVal = (a[key] || '').toLowerCase();
      const bVal = (b[key] || '').toLowerCase();
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  if (loading) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-electric/30 border-t-electric rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Checking ONT serial numbers...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">ONT Check</h3>
        <p className="text-slate-400 text-center max-w-md mb-6">
          Check new serial numbers from your logistics data against the ONT UPDATE database.
        </p>
        {onCheckClick && (
          <button
            onClick={onCheckClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Run ONT Check
          </button>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-slate-400 text-center">No new serial numbers found in the logistics data to check.</p>
      </div>
    );
  }

  const foundCount = data.filter(r => r.poNumber !== 'Not Found').length;
  const notFoundCount = data.filter(r => r.poNumber === 'Not Found').length;

  const renderSortableHeader = (label, key) => (
    <th
      className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors group"
      onClick={() => handleSort(key)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon direction={sortConfig.key === key ? sortConfig.direction : null} />
      </span>
    </th>
  );

  return (
    <div className="glass-card overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ONT Check Results</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {foundCount} Found
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            {notFoundCount} Not Found
          </span>
        </div>
        {/* Search */}
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search serial, PO, ONT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-9 pr-3 py-2 rounded-xl text-xs border transition-all duration-200 w-56 ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-200 placeholder-slate-500 focus:border-amber-500/50 focus:bg-white/[0.07]'
                : 'bg-slate-100 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-amber-500/50'
            } outline-none`}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={isDark ? 'bg-white/5 border-b border-white/5' : 'bg-slate-100/50 border-b border-slate-200'}>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap w-12">#</th>
              {renderSortableHeader('ONT S/N', 'serialNumber')}
              {renderSortableHeader('ONT Reservation No.', 'poNumber')}
              {renderSortableHeader('Add Noted', 'ontName')}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((record, index) => {
              const isFound = record.poNumber !== 'Not Found';
              return (
                <tr
                  key={index}
                  className={`transition-colors ${
                    isFound
                      ? 'hover:bg-white/5'
                      : 'bg-rose-500/5 hover:bg-rose-500/10 border-l-2 border-rose-500/50'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs text-slate-500 font-mono">{index + 1}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs text-slate-200 bg-white/5 px-2 py-1 rounded-md">
                      {record.serialNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      isFound ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {record.poNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {record.ontName !== '-' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {record.ontName}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-white/5 text-sm text-slate-400 text-center">
        Showing {sortedData?.length || 0} of {data.length} serial numbers.
        <span className="ml-2">
          <span className="text-emerald-400">{foundCount} found</span>
          {' · '}
          <span className="text-rose-400">{notFoundCount} not found</span>
        </span>
      </div>
    </div>
  );
}
