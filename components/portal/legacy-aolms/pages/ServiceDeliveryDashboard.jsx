'use client';
import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import DateRangeFilter from '../components/ui/DateRangeFilter';
import { isWithinDateRange } from '../utils/dateHelpers';
import * as api from '../api/serviceDeliveryApi';

/* ── Full-page / section loader overlay ── */
function LoaderOverlay({ message = 'Processing...' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center backdrop-blur-sm ${isDark ? 'bg-black/60' : 'bg-white/60'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className={`text-sm font-medium animate-pulse ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{message}</p>
      </div>
    </div>
  );
}

/* ── Inline section loader ── */
function SectionLoader({ message = 'Loading...' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="glass-card p-10 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{message}</p>
    </div>
  );
}

const TABS = [
  { id: 'dataVerification', label: 'Data Verification', icon: '📋' },
  { id: 'crossVerifyOnt', label: 'Cross Verification & ONT Check', icon: '🔄' },
  { id: 'finalOutput', label: 'Final Output', icon: '📊' },
];

function StatusBadge({ loaded, label, count }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${loaded ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
      <span className={`w-2 h-2 rounded-full ${loaded ? 'bg-emerald-400' : 'bg-slate-600'}`} />
      {label} {loaded && <span className="bg-white/10 px-1.5 rounded">{count}</span>}
    </div>
  );
}

function StatCard({ label, value, color = 'electric' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = { electric: 'text-blue-400', emerald: 'text-emerald-400', rose: 'text-rose-400', amber: 'text-amber-400', purple: 'text-purple-400' };
  return (
    <div className="glass-card p-4 hover:scale-[1.02] transition-all duration-300">
      <div className={`text-2xl font-bold mb-1 ${colors[color] || colors.electric}`}>{value}</div>
      <div className={`text-[10px] uppercase tracking-wider font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
    </div>
  );
}

/** Cell-level validation coloring */
function CellVal({ value, match }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (match === undefined || match === null) {
    return <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{value || '-'}</span>;
  }
  const bg = match
    ? (isDark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
    : (isDark ? 'bg-rose-500/15 text-rose-300' : 'bg-rose-50 text-rose-700');
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${bg}`}>
      {value || '-'}
    </span>
  );
}

export default function ServiceDeliveryDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('dataVerification');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState({});

  // Upload states
  const [wbsData, setWbsData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [allDates, setAllDates] = useState([]);

  // Tab results
  const [dvResults, setDvResults] = useState(null);
  const [cvResults, setCvResults] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  // Filters
  const [dvSearch, setDvSearch] = useState('');
  const [dvFilter, setDvFilter] = useState('all'); // 'all' | 'found' | 'notFound'
  const [cvSearch, setCvSearch] = useState('');
  const [cvFilter, setCvFilter] = useState('all'); // 'all' | 'foundInOnt' | 'ok' | 'investigate'
  const [finalSearch, setFinalSearch] = useState('');
  const [finalFilter, setFinalFilter] = useState('all'); // 'all' | stat-based filters
  const [finalWbsTypeFilter, setFinalWbsTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [finalSort, setFinalSort] = useState({ key: 'date', direction: 'desc' });
  const [finalPage, setFinalPage] = useState(1);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };
  const setL = (key, v) => setLoading(prev => ({ ...prev, [key]: v }));

  // ─────────── Upload Handlers ───────────

  const loadDatabase = async () => {
    try {
      setL('database',true);
      const r=await api.getStatus();const status=r.data;
      setWbsData({totalDelivered:status.wbsRecordCount});setResponseData({totalRecords:status.responseRecordCount});
      setAllDates(status.allDates||[]);setSelectedDate(status.selectedDate||'');
      setDvResults(null);setCvResults(null);setFinalResults(null);
    } catch(e) {setMsg({type:'error',text:e.message});} finally {setL('database',false);}
  };
  useEffect(()=>{void loadDatabase()},[]);

  const handleDateChange = async (d) => {
    if (!d || d === selectedDate) return;
    try {
      setL('date', true);
      const r = await api.changeDate(d);
      setWbsData(r.data);
      setSelectedDate(r.data.selectedDate || d);
      // Reset results for new date
      setDvResults(null);
      setCvResults(null);
    } catch (e) { flash('error', e.message); } finally { setL('date', false); }
  };

  // ─────────── Tab 1: Data Verification ───────────

  const runDataVerification = async () => {
    try {
      setL('dv', true);
      const r = await api.dataVerification(selectedDate);
      setDvResults(r.data);
      flash('success', r.message);
    } catch (e) { flash('error', e.message); } finally { setL('dv', false); }
  };

  const dvAllRows = useMemo(() => {
    let rows = dvResults?.results || [];
    if (dvSearch.trim()) {
      const term = dvSearch.toLowerCase();
      rows = rows.filter(row =>
        Object.values(row).some(v => String(v || '').toLowerCase().includes(term))
      );
    }
    return rows;
  }, [dvResults, dvSearch]);

  const dvStats = useMemo(() => ({
    total: dvAllRows.length,
    found: dvAllRows.filter(r => r.orderMatch).length,
    notFound: dvAllRows.filter(r => !r.orderMatch).length,
  }), [dvAllRows]);

  // Filtered by stat card click
  const dvRows = useMemo(() => {
    if (dvFilter === 'found') return dvAllRows.filter(r => r.orderMatch);
    if (dvFilter === 'notFound') return dvAllRows.filter(r => !r.orderMatch);
    return dvAllRows;
  }, [dvAllRows, dvFilter]);

  // ─────────── Tab 2: Cross Verification & ONT Check ───────────

  const runCrossVerifyOnt = async () => {
    try {
      setL('cv', true);
      const r = await api.crossVerifyOnt(selectedDate);
      setCvResults(r.data);
      flash('success', r.message);
    } catch (e) { flash('error', e.message); } finally { setL('cv', false); }
  };

  const cvAllRows = useMemo(() => {
    let rows = cvResults?.results || [];
    if (cvSearch.trim()) {
      const term = cvSearch.toLowerCase();
      rows = rows.filter(row =>
        Object.values(row).some(v => String(v || '').toLowerCase().includes(term))
      );
    }
    return rows;
  }, [cvResults, cvSearch]);

  const cvStats = useMemo(() => ({
    total: cvAllRows.length,
    foundInOnt: cvAllRows.filter(r => r.foundInOnt).length,
    investigate: cvAllRows.filter(r => r.status === 'Investigate').length,
    ok: cvAllRows.filter(r => r.status === 'OK').length,
  }), [cvAllRows]);

  // Filtered by stat card click
  const cvRows = useMemo(() => {
    if (cvFilter === 'foundInOnt') return cvAllRows.filter(r => r.foundInOnt);
    if (cvFilter === 'ok') return cvAllRows.filter(r => r.status === 'OK');
    if (cvFilter === 'investigate') return cvAllRows.filter(r => r.status === 'Investigate');
    return cvAllRows;
  }, [cvAllRows, cvFilter]);

  // ─────────── Tab 3: Final Output ───────────

  const runFinalOutput = async () => {
    try {
      setL('finalOutput', true);
      const r = await api.finalOutput();
      setFinalResults(r.data);
      setFinalPage(1);
      flash('success', r.message);
    } catch (e) { flash('error', e.message); } finally { setL('finalOutput', false); }
  };

  const finalAllRows = useMemo(() => {
    let rows = finalResults?.results || [];
    rows = rows.filter(row => isWithinDateRange(row.date, dateRange));
    if (finalWbsTypeFilter && finalWbsTypeFilter !== 'all') {
      rows = rows.filter(row => (row.wbsType || '') === finalWbsTypeFilter);
    }
    if (finalSearch.trim()) {
      const term = finalSearch.toLowerCase();
      rows = rows.filter(row => Object.values(row).some(value => String(Array.isArray(value) ? value.join(' ') : value || '').toLowerCase().includes(term)));
    }
    if (finalSort.key) {
      rows = [...rows].sort((a, b) => {
        const isNumber = finalSort.key === 'labourCharge' || finalSort.key === 'cpeCharge';
        const aVal = isNumber ? Number(a[finalSort.key] || 0) : String(a[finalSort.key] || '').toLowerCase();
        const bVal = isNumber ? Number(b[finalSort.key] || 0) : String(b[finalSort.key] || '').toLowerCase();
        if (aVal < bVal) return finalSort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return finalSort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [finalResults, dateRange, finalWbsTypeFilter, finalSearch, finalSort]);

  // Filtered by stat card click
  const finalRows = useMemo(() => {
    if (finalFilter === 'withWarnings') return finalAllRows.filter(r => r.warnings?.length > 0);
    if (finalFilter === 'clean') return finalAllRows.filter(r => !r.warnings?.length);
    return finalAllRows;
  }, [finalAllRows, finalFilter]);

  const uniqueWbsTypes = useMemo(() => {
    const types = new Set((finalResults?.results || []).map(r => r.wbsType || '').filter(Boolean));
    return Array.from(types).sort();
  }, [finalResults]);

  const finalPageSize = 25;
  const finalTotalPages = Math.max(1, Math.ceil(finalRows.length / finalPageSize));
  const finalPageRows = useMemo(() => finalRows.slice((finalPage - 1) * finalPageSize, finalPage * finalPageSize), [finalRows, finalPage]);
  const handleFinalSort = (key) => setFinalSort(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

  const exportFinalOutput = () => {
    const worksheet = XLSX.utils.json_to_sheet(finalRows.map(({ warnings, ...row }) => ({ ...row, warnings: warnings?.join('; ') || '' })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Final Output');
    XLSX.writeFile(workbook, 'service-assurance-final-output.xlsx');
  };

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="animate-fade-in">
      {/* Global Loader Overlay */}
      {loading.dv && <LoaderOverlay message="Running Data Verification..." />}
      {loading.cv && <LoaderOverlay message="Running Cross Verification & ONT Check..." />}
      {loading.finalOutput && <LoaderOverlay message="Generating Final Output..." />}
      {/* Header */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>Service Assurance</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{greeting} — manage delivery orders & validations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2.5 text-sm text-slate-300">
            {now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Toast */}
      {msg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium animate-fade-in ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{msg.text}</div>
      )}

      <button className="task-action mb-4" onClick={loadDatabase} disabled={loading.database}>{loading.database?'Loading…':'Refresh records'}</button>
      {/* Status Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <StatusBadge loaded={!!wbsData} label="Delivery orders" count={wbsData?.totalDelivered || 0} />
        <StatusBadge loaded={!!responseData} label="Technician responses" count={responseData?.totalRecords || 0} />
      </div>

      {/* Tabs */}
      <div className={`flex flex-wrap items-center gap-1 mb-6 p-1 rounded-xl w-fit ${isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-slate-100 border border-slate-200'}`}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${activeTab === t.id ? 'bg-electric/15 text-blue-400 shadow-sm' : isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════ Tab 1: Data Verification ═══════════ */}
      {activeTab === 'dataVerification' && (
        <div className="space-y-6">
          {wbsData && responseData && (
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {/* Single Date Dropdown */}
                {allDates.length > 0 && (
                  <select value={selectedDate} onChange={e => handleDateChange(e.target.value)} disabled={loading.date}
                    className={`text-xs px-3 py-2.5 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'} ${loading.date ? 'opacity-50' : ''}`}>
                    {allDates.map((d, i) => <option key={i} value={d}>{d}{i === 0 ? ' (latest)' : ''}</option>)}
                  </select>
                )}
                <button onClick={runDataVerification} disabled={loading.dv}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-electric to-blue-700 text-white text-sm font-medium hover:shadow-lg hover:shadow-electric/25 transition-all duration-300 disabled:opacity-50">
                  {loading.dv ? 'Verifying...' : '▶ Verify Data'}
                </button>

                {/* Search */}
                {dvResults && (
                  <input
                    type="search"
                    value={dvSearch}
                    onChange={(e) => setDvSearch(e.target.value)}
                    placeholder="Search records..."
                    className={`ml-auto px-3 py-2 rounded-lg border outline-none text-xs ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                  />
                )}
              </div>

              {/* Stats — click to filter */}
              {dvResults && (
                <div className="flex gap-3 mb-4 flex-wrap">
                  <div onClick={() => setDvFilter('all')} className="cursor-pointer">
                    <StatCard label="Total" value={dvStats.total} color="electric" />
                    {dvFilter === 'all' && <div className="h-0.5 mt-1 rounded bg-blue-400 mx-2" />}
                  </div>
                  <div onClick={() => setDvFilter('found')} className="cursor-pointer">
                    <StatCard label="Found" value={dvStats.found} color="emerald" />
                    {dvFilter === 'found' && <div className="h-0.5 mt-1 rounded bg-emerald-400 mx-2" />}
                  </div>
                  <div onClick={() => setDvFilter('notFound')} className="cursor-pointer">
                    <StatCard label="Not Found" value={dvStats.notFound} color="rose" />
                    {dvFilter === 'notFound' && <div className="h-0.5 mt-1 rounded bg-rose-400 mx-2" />}
                  </div>
                </div>
              )}

              {/* Data Verification Table */}
              {loading.dv ? (
                <SectionLoader message="Running Data Verification..." />
              ) : dvResults ? (
                dvRows.length === 0 ? (
                  <div className="glass-card p-10 text-center text-slate-400">
                    <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>0 Records</h3>
                    <p className="text-sm">No records match current filters.</p>
                  </div>
                ) : (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}>
                            {[
                              'Date', 'WBS Order', 'Response Order', 'WBS Type', 'Response FTTR Type',
                              'WBS Connection Type', 'Response Connection Type', 'WBS Nce SN'
                            ].map(h => (
                              <th key={h} className={`px-3 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dvRows.map((row, i) => (
                            <tr key={i} className={`border-t transition-colors ${isDark ? 'border-white/[0.03] hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'}`}>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.date}</td>
                              <td className="px-3 py-2"><CellVal value={row.wbsOrder} match={row.orderMatch} /></td>
                              <td className="px-3 py-2"><CellVal value={row.responseOrderNumber} match={row.orderMatch} /></td>
                              <td className="px-3 py-2"><CellVal value={row.wbsType} match={row.typeMatch} /></td>
                              <td className="px-3 py-2"><CellVal value={row.responseFttrOrderType} match={row.typeMatch} /></td>
                              <td className="px-3 py-2"><CellVal value={row.wbsConnectionType} match={row.connectionMatch} /></td>
                              <td className="px-3 py-2"><CellVal value={row.responseConnectionType} match={row.connectionMatch} /></td>
                              <td className="px-3 py-2"><CellVal value={row.wbsNceSN} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">Run verification to see results</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Tab 2: Cross Verification & ONT Check ═══════════ */}
      {activeTab === 'crossVerifyOnt' && (
        <div className="space-y-6">
          {wbsData ? (
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {/* Single Date Dropdown */}
                {allDates.length > 0 && (
                  <select value={selectedDate} onChange={e => handleDateChange(e.target.value)} disabled={loading.date}
                    className={`text-xs px-3 py-2.5 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'} ${loading.date ? 'opacity-50' : ''}`}>
                    {allDates.map((d, i) => <option key={i} value={d}>{d}{i === 0 ? ' (latest)' : ''}</option>)}
                  </select>
                )}
                <button onClick={runCrossVerifyOnt} disabled={loading.cv}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-700 text-white text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50">
                  {loading.cv ? 'Checking...' : '▶ Run Check'}
                </button>

                {/* Search */}
                {cvResults && (
                  <input
                    type="search"
                    value={cvSearch}
                    onChange={(e) => setCvSearch(e.target.value)}
                    placeholder="Search records..."
                    className={`ml-auto px-3 py-2 rounded-lg border outline-none text-xs ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                  />
                )}
              </div>

              {/* Stats — click to filter */}
              {cvResults && (
                <div className="flex gap-3 mb-4 flex-wrap">
                  <div onClick={() => setCvFilter('all')} className="cursor-pointer">
                    <StatCard label="Total" value={cvStats.total} color="electric" />
                    {cvFilter === 'all' && <div className="h-0.5 mt-1 rounded bg-blue-400 mx-2" />}
                  </div>
                  <div onClick={() => setCvFilter('foundInOnt')} className="cursor-pointer">
                    <StatCard label="Found in ONT" value={cvStats.foundInOnt} color="emerald" />
                    {cvFilter === 'foundInOnt' && <div className="h-0.5 mt-1 rounded bg-emerald-400 mx-2" />}
                  </div>
                  <div onClick={() => setCvFilter('ok')} className="cursor-pointer">
                    <StatCard label="OK" value={cvStats.ok} color="purple" />
                    {cvFilter === 'ok' && <div className="h-0.5 mt-1 rounded bg-purple-400 mx-2" />}
                  </div>
                  <div onClick={() => setCvFilter('investigate')} className="cursor-pointer">
                    <StatCard label="Investigate" value={cvStats.investigate} color="rose" />
                    {cvFilter === 'investigate' && <div className="h-0.5 mt-1 rounded bg-rose-400 mx-2" />}
                  </div>
                </div>
              )}

              {/* Table */}
              {loading.cv ? (
                <SectionLoader message="Running Cross Verification & ONT Check..." />
              ) : cvResults ? (
                cvRows.length === 0 ? (
                  <div className="glass-card p-10 text-center text-slate-400">
                    <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>0 Records</h3>
                    <p className="text-sm">No records match current filters.</p>
                  </div>
                ) : (
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className={isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}>
                            {[
                              'Date', 'Team', 'Order #', 'Type', 'Connection Type',
                              'Serial (Nce SN)', 'Scenario', 'PO Number', 'Status', 'Notes'
                            ].map(h => (
                              <th key={h} className={`px-3 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cvRows.map((row, i) => (
                            <tr key={i} className={`border-t transition-colors ${row.status === 'Investigate' ? (isDark ? 'bg-rose-500/10' : 'bg-rose-50') : ''} ${isDark ? 'border-white/[0.03] hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'}`}>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.date}</td>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.team}</td>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.orderNumber}</td>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.orderType}</td>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.connectionType}</td>
                              <td className={`px-3 py-2 font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.nceSN || '-'}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.scenario === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                  {row.scenario}
                                </span>
                              </td>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.poNumber || '-'}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${row.status === 'OK' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className={`px-3 py-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{row.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">Run check to see results</p>
              )}
            </div>
          ) : (
            <div className={`glass-card p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <p className="text-sm">No delivery data available. Add orders in Projects.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ Tab 3: Final Output ═══════════ */}
      {activeTab === 'finalOutput' && (
        <div className="space-y-6">
          {wbsData ? (
            <div>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <button onClick={runFinalOutput} disabled={loading.finalOutput}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 text-white text-sm font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50">
                  {loading.finalOutput ? 'Generating...' : 'Generate Final Output'}
                </button>
                {finalResults && (
                  <>
                    <button onClick={exportFinalOutput}
                      className={`px-3 py-2 rounded-xl text-xs border ${isDark ? 'bg-white/5 text-slate-200 border-white/10 hover:bg-white/10' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
                      Export Excel
                    </button>
                    {/* Search */}
                    <input
                      type="search"
                      value={finalSearch}
                      onChange={(e) => { setFinalSearch(e.target.value); setFinalPage(1); }}
                      placeholder="Search final output"
                      className={`ml-auto px-3 py-2 rounded-lg border outline-none text-xs ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                    />
                  </>
                )}
              </div>

              {/* Date Range Filter + WBS Type Filter + Stats — above table */}
              {finalResults && (
                <>
                  <div className="glass-card p-4 mb-4 flex items-center gap-3 flex-wrap text-xs text-slate-400">
                    <DateRangeFilter
                      value={dateRange}
                      onChange={(range) => { setDateRange(range); setFinalPage(1); }}
                      storageKey="serviceDeliveryDateRange"
                      label="Date Range"
                    />
                    {/* WBS Type filter */}
                    <select
                      value={finalWbsTypeFilter}
                      onChange={(e) => { setFinalWbsTypeFilter(e.target.value); setFinalPage(1); }}
                      className={`text-xs px-3 py-2.5 rounded-xl border outline-none ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
                    >
                      <option value="all">All WBS Types</option>
                      {uniqueWbsTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {finalResults.warnings?.length > 0 && <span className="text-amber-400">Warnings: {finalResults.warnings.join(', ')}</span>}
                  </div>

                  {/* Stats — click to filter */}
                  <div className="flex gap-3 mb-4 flex-wrap">
                    <div onClick={() => { setFinalFilter('all'); setFinalPage(1); }} className="cursor-pointer">
                      <StatCard label="Total" value={finalAllRows.length} color="electric" />
                      {finalFilter === 'all' && <div className="h-0.5 mt-1 rounded bg-blue-400 mx-2" />}
                    </div>
                    <div onClick={() => { setFinalFilter('withWarnings'); setFinalPage(1); }} className="cursor-pointer">
                      <StatCard label="With Warnings" value={finalAllRows.filter(r => r.warnings?.length > 0).length} color="amber" />
                      {finalFilter === 'withWarnings' && <div className="h-0.5 mt-1 rounded bg-amber-400 mx-2" />}
                    </div>
                    <div onClick={() => { setFinalFilter('clean'); setFinalPage(1); }} className="cursor-pointer">
                      <StatCard label="Clean" value={finalAllRows.filter(r => !r.warnings?.length).length} color="emerald" />
                      {finalFilter === 'clean' && <div className="h-0.5 mt-1 rounded bg-emerald-400 mx-2" />}
                    </div>
                  </div>
                </>
              )}

              {loading.finalOutput ? (
                <SectionLoader message="Generating Final Output..." />
              ) : !finalResults ? (
                <p className="text-sm text-slate-500 text-center py-8">Generate Final Output to see results</p>
              ) : finalRows.length === 0 ? (
                <div className="glass-card p-10 text-center text-slate-400">
                  <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>0 Matching Records</h3>
                  <p className="text-sm">No results exist for the applied filters.</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className={isDark ? 'bg-white/[0.03]' : 'bg-slate-50'}>
                          {[
                            ['orderNumber', 'Order Number'], ['projectType', 'Project Type'], ['wbsType', 'WBS Type'], ['date', 'Date'],
                            ['exchange', 'Exchange'], ['lo', 'LO'], ['connectionType', 'Connection Type'],
                            ['serialNumber', 'Serial Number'], ['poNumber', 'PO Number'], ['assetDescription', 'Asset Description'],
                            ['labourCharge', 'Labour Charge'], ['cpeCharge', 'CPE Charge'], ['warnings', 'Warnings'],
                          ].map(([key, label]) => (
                            <th key={key} onClick={() => handleFinalSort(key)}
                              className={`px-3 py-2.5 text-left font-semibold uppercase tracking-wider cursor-pointer whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {label}{finalSort.key === key ? ` ${finalSort.direction === 'asc' ? '↑' : '↓'}` : ''}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {finalPageRows.map((row, index) => (
                          <tr key={`${row.orderNumber}-${index}`} className={`border-t ${isDark ? 'border-white/[0.03] hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'}`}>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.orderNumber}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.projectType}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.wbsType || '-'}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.date}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.exchange}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.lo}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.connectionType}</td>
                            <td className={`px-3 py-2 font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.serialNumber || '-'}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.poNumber || '-'}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.assetDescription || '-'}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.labourCharge}</td>
                            <td className={`px-3 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.cpeCharge}</td>
                            <td className="px-3 py-2 text-amber-400">{row.warnings?.join('; ') || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className={`p-4 border-t flex items-center justify-between text-sm ${isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                    <span>Page {finalPage} of {finalTotalPages}</span>
                    <div className="flex gap-2">
                      <button disabled={finalPage <= 1} onClick={() => setFinalPage(p => Math.max(1, p - 1))} className={`px-3 py-1.5 rounded-lg disabled:opacity-40 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>Prev</button>
                      <button disabled={finalPage >= finalTotalPages} onClick={() => setFinalPage(p => Math.min(finalTotalPages, p + 1))} className={`px-3 py-1.5 rounded-lg disabled:opacity-40 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>Next</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`glass-card p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <p className="text-sm">No delivery data available. Add orders in Projects.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
