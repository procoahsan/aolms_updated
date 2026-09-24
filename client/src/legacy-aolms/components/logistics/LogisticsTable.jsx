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

export default function LogisticsTable({ data, loading, onUploadClick, hasComparison }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      if (prev.direction === 'desc') return { key: null, direction: null };
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!data?.length || !sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const { key, direction } = sortConfig;
      let aVal, bVal;

      if (key === 'date') {
        aVal = a.date ? new Date(a.date).getTime() : 0;
        bVal = b.date ? new Date(b.date).getTime() : 0;
      } else if (key === 'status') {
        aVal = (a.status || '').toLowerCase();
        bVal = (b.status || '').toLowerCase();
      }

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-electric/30 border-t-electric rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading logistics data...</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric/10 to-purple/10 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-electric-light">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Logistics Data Yet</h3>
        <p className="text-slate-400 text-center max-w-md mb-6">
          Upload a Logistics Excel file to view filtered records — showing resolved tickets from the 2nd latest date.
        </p>
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric to-electric-dark text-white text-sm font-medium hover:shadow-lg hover:shadow-electric/25 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Logistics File
          </button>
        )}
      </div>
    );
  }

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

  const getRowClass = (record) => {
    if (!hasComparison) return 'hover:bg-white/5 transition-colors group';
    if (record.isMatch) return 'bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors border-l-2 border-emerald-500/50';
    return 'bg-rose-500/10 hover:bg-rose-500/15 transition-colors border-l-2 border-rose-500/50';
  };

  const matchCount = hasComparison ? data.filter(r => r.isMatch).length : 0;
  const mismatchCount = hasComparison ? data.filter(r => !r.isMatch).length : 0;

  return (
    <div className="glass-card overflow-hidden">
      {hasComparison && (
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-4 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Comparison Result</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {matchCount} Matched
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            {mismatchCount} Mismatched
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={isDark ? 'bg-white/5 border-b border-white/5' : 'bg-slate-100/50 border-b border-slate-200'}>
              {hasComparison && (
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap w-8">
                  <span title="Match status">✓/✗</span>
                </th>
              )}
              {renderSortableHeader('Date (A)', 'date')}
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Ticket No (P)</th>
              {renderSortableHeader('Status (Z)', 'status')}
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Team (C)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Package (E)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Exchange (F)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Block (G)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Road (H)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Col I (I)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Flat (J)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">LO Name (O)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Root Cause (AA)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Resolution (AB)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Res. Desc (AC)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Faulty (AF)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">ONT (AG)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">SN Old ONT (AH)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">New SN (AI)</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Protection Box (AJ)</th>
              {hasComparison && (
                <th className="px-4 py-3 text-xs font-semibold text-amber-400 uppercase tracking-wider whitespace-nowrap min-w-[200px]">Remarks</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedData.map((record) => (
              <tr key={record.id} className={getRowClass(record)}>
                {hasComparison && (
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {record.isMatch ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mx-auto">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400 mx-auto">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-white">{record.date || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.ticketNo || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border ${(() => {
                      const s = (record.status || '').toLowerCase().replace(/[_\s]+/g, ' ');
                      if (s.includes('remotely resolved') || s.includes('resolved remotely')) {
                        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                      }
                      if (s.includes('resolved')) {
                        return 'bg-emerald/10 text-emerald border-emerald/20';
                      }
                      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                    })()}`}>
                    {record.status?.toUpperCase() || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.team || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.package || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.exchange || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.block || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.road || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.colI || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.flat || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300 truncate max-w-[150px]" title={record.loName}>{record.loName || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300 truncate max-w-[150px]" title={record.rootCause}>
                    {record.rootCause || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300 truncate max-w-[150px]" title={record.resolution}>
                    {record.resolution || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300 truncate max-w-[150px]" title={record.resolutionDesc}>{record.resolutionDesc || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-slate-300">{record.faultyDamaged || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`font-mono text-sm ${
                    hasComparison && record.teamOnt && record.ont &&
                    record.ont.trim().toLowerCase() !== record.teamOnt.trim().toLowerCase()
                      ? 'text-rose-400 font-semibold'
                      : 'text-slate-300'
                  }`}>
                    {record.ont || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`font-mono text-xs ${
                    hasComparison && record.teamOldSn && record.snOldOnt &&
                    record.snOldOnt.trim().toLowerCase() !== record.teamOldSn.trim().toLowerCase()
                      ? 'text-rose-400 font-semibold'
                      : 'text-slate-300'
                  }`}>
                    {record.snOldOnt || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`font-mono text-xs ${
                    hasComparison && record.teamNewSn && record.newSnNo &&
                    record.newSnNo.trim().toLowerCase() !== record.teamNewSn.trim().toLowerCase()
                      ? 'text-rose-400 font-semibold'
                      : 'text-slate-300'
                  }`}>
                    {record.newSnNo || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={`text-sm ${
                    hasComparison && record.teamOntBox && record.ontProtectionBox &&
                    record.ontProtectionBox.trim().toLowerCase() !== record.teamOntBox.trim().toLowerCase()
                      ? 'text-rose-400 font-semibold'
                      : 'text-slate-300'
                  }`}>
                    {record.ontProtectionBox || '-'}
                  </div>
                </td>
                {hasComparison && (
                  <td className="px-4 py-3">
                    {record.remarks?.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {record.remarks.map((remark, i) => (
                          <div
                            key={i}
                            className="text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 whitespace-nowrap"
                            title={remark}
                          >
                            {remark}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 whitespace-nowrap">
                        ✓ All matched
                      </span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-white/5 text-sm text-slate-400 text-center">
        Showing {data.length} records matching the criteria.
        {hasComparison && (
          <span className="ml-2">
            <span className="text-emerald-400">{matchCount} matched</span>
            {' · '}
            <span className="text-rose-400">{mismatchCount} mismatched</span>
          </span>
        )}
      </div>
    </div>
  );
}
