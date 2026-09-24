import { useState } from 'react';
import { CategoryBadge, StatusBadge } from '../ui/StatusBadge';
import ExpiryIndicator from './ExpiryIndicator';
import StaffDetailModal from './StaffDetailModal';
import { getExpiryStatus } from '../../utils/dateHelpers';

export default function StaffTable({ data, loading }) {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = String(a[sortConfig.key] || '');
    const bVal = String(b[sortConfig.key] || '');
    const result = aVal.localeCompare(bVal);
    return sortConfig.direction === 'desc' ? -result : result;
  });

  const SortHeader = ({ label, field }) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 cursor-pointer hover:text-electric-light transition-colors select-none group"
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {sortConfig.key === field ? (
            sortConfig.direction === 'asc' ? '↑' : '↓'
          ) : '↕'}
        </span>
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-8 space-y-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-navy-700/30 animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="overflow-hidden">
          <table className="w-full" id="staff-table">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-10">#</th>
                <SortHeader label="Name" field="name" />
                <SortHeader label="Contact" field="contactPersonal" />
                <SortHeader label="CPR" field="cpr" />
                <SortHeader label="Nationality" field="nationality" />
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Expiry Status</th>
                <SortHeader label="Visa" field="visa" />
                <SortHeader label="Category" field="staffCategory" />
                <SortHeader label="Status" field="status" />
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {sortedData.map((staff, index) => {
                const rpStatus = getExpiryStatus(staff.rpExpiry);
                const hasExpiryIssue = rpStatus === 'expired' || rpStatus === 'critical';

                return (
                  <tr
                    key={staff.id || index}
                    onClick={() => setSelectedStaff(staff)}
                    className={`table-row-hover cursor-pointer ${
                      hasExpiryIssue ? 'bg-rose/[0.03]' : ''
                    }`}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 font-mono">{index + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric/20 to-purple/20 flex items-center justify-center text-electric-light text-xs font-bold flex-shrink-0">
                          {staff.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-200 block">{staff.name}</span>
                          <span className="text-[11px] text-slate-500">{staff.contactOffice}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300 font-mono">{staff.contactPersonal}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300 font-mono">{staff.cpr || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-300">
                        {staff.nationality && staff.nationality !== 'NEED TO FILL' ? staff.nationality : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <ExpiryIndicator date={staff.rpExpiry} label="RP" />
                        <ExpiryIndicator date={staff.cprExpiry} label="CPR" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400">{staff.visa || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={staff.staffCategory} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={staff.status} />
                    </td>
                    <td className="px-4 py-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="text-slate-300 font-medium">{sortedData.length}</span> staff members
          </p>
          <p className="text-xs text-slate-500">Click a row to view full details</p>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedStaff && (
        <StaffDetailModal staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
      )}
    </>
  );
}
