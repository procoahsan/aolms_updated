import { useState, useRef, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLogistics } from '../contexts/LogisticsContext';
import LogisticsTable from '../components/logistics/LogisticsTable';
import LogisticsPieChart from '../components/logistics/LogisticsPieChart';
import OntCheckTable from '../components/logistics/OntCheckTable';
import { uploadLogisticsExcel, uploadTeamExcel, changeDate as changeDateApi, checkOntUpdate } from '../api/logisticsApi';
import ThemeToggle from '../components/ui/ThemeToggle';
import DateRangeFilter from '../components/ui/DateRangeFilter';
import { describeDateRange, isWithinDateRange } from '../utils/dateHelpers';

const FILTER_BUTTONS = [
  {
    key: 'resolved',
    label: 'Resolved',
    color: 'emerald',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    key: 'remotelyResolved',
    label: 'Remotely Resolved',
    color: 'indigo',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

export default function LogisticsDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    data, setData, loading, setLoading,
    availableDates, setAvailableDates,
    selectedDate, setSelectedDate,
    ontCheckData, setOntCheckData,
    activeTab, setActiveTab,
  } = useLogistics();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const fileInputRef = useRef(null);
  const tableRef = useRef(null);

  // Team sheet upload state
  const [teamUploading, setTeamUploading] = useState(false);
  const [teamUploadMsg, setTeamUploadMsg] = useState(null);
  const [showTeamUploadModal, setShowTeamUploadModal] = useState(false);
  const [teamDragActive, setTeamDragActive] = useState(false);
  const teamFileInputRef = useRef(null);
  const [ontLoading, setOntLoading] = useState(false);
  const [dateChanging, setDateChanging] = useState(false);

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  // Determine 2nd latest date from data
  const secondLatestDate = useMemo(() => {
    if (!data?.length) return null;
    const allDates = [...new Set(data.map(r => r.date).filter(Boolean))].sort((a, b) => {
      const da = new Date(a);
      const db = new Date(b);
      return db - da;
    });
    return allDates.length >= 1 ? allDates[1] : null;
  }, [data]);

  // Compute stats from uploaded data
  const stats = useMemo(() => {
    if (!data?.length) return null;
    const total = data.length;
    const resolved = data.filter(r => {
      const s = r.status?.toLowerCase().replace(/[_\s]+/g, ' ') || '';
      return s.includes('resolved') && !s.includes('remotely resolved');
    }).length;
    const remotelyResolved = data.filter(r => {
      const s = r.status?.toLowerCase().replace(/[_\s]+/g, ' ') || '';
      return s.includes('remotely resolved') || s.includes('resolved remotely') || s.includes('resolved_remotely');
    }).length;
    const secondLatest = secondLatestDate
      ? data.filter(r => r.date === secondLatestDate).length
      : 0;
    const other = total - resolved - remotelyResolved;
    const uniqueTeams = [...new Set(data.map(r => r.team).filter(Boolean))];

    // Comparison stats (only when team sheet uploaded)
    const hasComparison = data.some(r => r.teamSheetFound !== undefined);
    const matchCount = hasComparison ? data.filter(r => r.isMatch).length : null;
    const mismatchCount = hasComparison ? data.filter(r => !r.isMatch).length : null;

    return { total, resolved, remotelyResolved, secondLatest, other, uniqueTeams: uniqueTeams.length, hasComparison, matchCount, mismatchCount };
  }, [data, secondLatestDate]);

  const normalizeStatus = (status) => (status || '').toLowerCase().replace(/[_\s]+/g, ' ').trim();

  const isResolvedRemotely = (status) => {
    const s = normalizeStatus(status);
    return s.includes('remotely resolved') || s.includes('resolved remotely') || s.includes('resolved_remotely');
  };

  const isResolvedOnly = (status) => {
    const s = normalizeStatus(status);
    return s.includes('resolved') && !isResolvedRemotely(status);
  };

  const filteredData = useMemo(() => {
    if (!data?.length) return data;
    let rows = data.filter(r => isWithinDateRange(r.date, dateRange));
    if (activeFilter === 'resolved') rows = rows.filter(r => isResolvedOnly(r.status));
    if (activeFilter === 'remotelyResolved') rows = rows.filter(r => isResolvedRemotely(r.status));
    return rows;
  }, [data, activeFilter, dateRange]);

  const handleFilterClick = (filterKey) => {
    setActiveFilter(prev => prev === filterKey ? null : filterKey);
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ===== Logistics upload =====
  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadMsg(null);
      const result = await uploadLogisticsExcel(file);
      setUploadMsg({ type: 'success', text: result.data?.length ? result.message : `0 Matching Records for ${result.selectedDate || 'the selected date'}` });
      setData(result.data || []);
      setAvailableDates(result.allDates || []);
      setSelectedDate(result.selectedDate || '');
      setActiveFilter(null);
      setOntCheckData(null);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadMsg(null);
      }, 2000);
    } catch (err) {
      setUploadMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) handleFileUpload(files[0]);
  };

  // ===== Team upload =====
  const handleTeamFileUpload = async (file) => {
    if (!file) return;
    try {
      setTeamUploading(true);
      setTeamUploadMsg(null);
      const result = await uploadTeamExcel(file);
      setTeamUploadMsg({ type: 'success', text: result.message });
      setData(result.data);
      if (result.availableDates) setAvailableDates(result.availableDates);
      if (result.selectedDate) setSelectedDate(result.selectedDate);
      setActiveFilter(null);
      setTimeout(() => {
        setShowTeamUploadModal(false);
        setTeamUploadMsg(null);
      }, 2500);
    } catch (err) {
      setTeamUploadMsg({ type: 'error', text: err.message });
    } finally {
      setTeamUploading(false);
    }
  };

  const handleTeamDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setTeamDragActive(true);
    else if (e.type === 'dragleave') setTeamDragActive(false);
  };

  const handleTeamDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTeamDragActive(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) handleTeamFileUpload(files[0]);
  };

  // ===== Date change handler =====
  const handleDateChange = async (newDate) => {
    if (!newDate || newDate === selectedDate) return;
    try {
      setDateChanging(true);
      const result = await changeDateApi(newDate);
      setData(result.data);
      if (result.availableDates) setAvailableDates(result.availableDates);
      setSelectedDate(result.selectedDate || newDate);
      setActiveFilter(null);
    } catch (err) {
      console.error('Date change failed:', err);
    } finally {
      setDateChanging(false);
    }
  };

  // ===== ONT Check handler =====
  const handleOntCheck = async () => {
    try {
      setOntLoading(true);
      const result = await checkOntUpdate();
      setOntCheckData(result.data);
    } catch (err) {
      console.error('ONT check failed:', err);
    } finally {
      setOntLoading(false);
    }
  };

  const getFilterCount = (key) => {
    if (!stats) return 0;
    if (key === 'resolved') return stats.resolved;
    if (key === 'remotelyResolved') return stats.remotelyResolved;
    return 0;
  };

  const colorMap = {
    emerald: {
      active: 'bg-emerald/15 text-emerald border-emerald/30 shadow-lg shadow-emerald/10',
      inactive: isDark
        ? 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06] hover:text-slate-200'
        : 'bg-slate-100/50 text-slate-500 border-slate-200/50 hover:bg-slate-200/50 hover:text-slate-700',
    },
    indigo: {
      active: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-lg shadow-indigo-500/10',
      inactive: isDark
        ? 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06] hover:text-slate-200'
        : 'bg-slate-100/50 text-slate-500 border-slate-200/50 hover:bg-slate-200/50 hover:text-slate-700',
    },
    amber: {
      active: 'bg-amber/15 text-amber border-amber/30 shadow-lg shadow-amber/10',
      inactive: isDark
        ? 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.06] hover:text-slate-200'
        : 'bg-slate-100/50 text-slate-500 border-slate-200/50 hover:bg-slate-200/50 hover:text-slate-700',
    },
  };

  const hasComparison = stats?.hasComparison;

  return (
    <div className="animate-fade-in">
      {/* ===== Header ===== */}
      <header className="flex items-start justify-between  mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Logistics Management</h1>
          <p className="text-slate-400 text-sm mt-1">{greeting} — manage your logistics records</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Upload Team Sheet — shown only after logistics data is loaded */}
          {data?.length > 0 && (
            <button
              onClick={() => setShowTeamUploadModal(true)}
              id="upload-team-btn"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium hover:shadow-lg hover:shadow-emerald-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {hasComparison ? 'Re-upload Team Sheet' : 'Upload Team Sheet'}
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            id="upload-logistics-btn"
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
          <div className="glass-card px-4 py-2.5 text-sm text-slate-300">
            {now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ===== Tab Navigation ===== */}
      {data?.length > 0 && (
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab('logistics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'logistics'
                ? 'bg-electric/15 text-electric-light shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            Logistics Data
          </button>
          <button
            onClick={() => setActiveTab('ontCheck')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'ontCheck'
                ? 'bg-amber-500/15 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            ONT Check
            {ontCheckData && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20">
                {ontCheckData.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ===== ONT Check Tab ===== */}
      {activeTab === 'ontCheck' && data?.length > 0 ? (
        <OntCheckTable data={ontCheckData} loading={ontLoading} onCheckClick={handleOntCheck} />
      ) : (
      <>

      {/* ===== Stats Cards ===== */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          {/* Total Records */}
          <div className="glass-card p-5 cursor-default group hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-light">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Records</div>
          </div>

          {/* Resolved */}
          <div className="glass-card p-5 cursor-default group hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-light">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.resolved}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Resolved</div>
          </div>

          {/* Remotely Resolved */}
          <div className="glass-card p-5 cursor-default group hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stats.remotelyResolved}</div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Remotely Resolved</div>
          </div>

          {/* Teams or Match Stats */}
          {hasComparison ? (
            <div className="glass-card p-5 cursor-default group hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl font-bold text-emerald">{stats.matchCount}</span>
                <span className="text-slate-500">/</span>
                <span className="text-2xl font-bold text-rose-400">{stats.mismatchCount}</span>
              </div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Match / Mismatch</div>
            </div>
          ) : (
            <div className="glass-card p-5 cursor-default group hover:scale-[1.02] transition-all duration-300" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-light">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.uniqueTeams}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Teams</div>
            </div>
          )}
        </div>
      )}

      {/* ===== Pie Chart ===== */}
      {data?.length > 0 && (
        <div className="mb-8">
          <LogisticsPieChart
            data={data}
            onSegmentClick={handleFilterClick}
            activeFilter={activeFilter}
          />
        </div>
      )}

      {/* ===== Filter Buttons + Date Range ===== */}
      {data?.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold mr-1">Filter:</span>
          {FILTER_BUTTONS.map((fb) => {
            const isActive = activeFilter === fb.key;
            const count = getFilterCount(fb.key);
            return (
              <button
                key={fb.key}
                onClick={() => handleFilterClick(fb.key)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all duration-300 ${
                  isActive ? colorMap[fb.color].active : colorMap[fb.color].inactive
                }`}
              >
                {fb.icon}
                {fb.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  isActive ? 'bg-white/10' : 'bg-white/5'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200 border border-transparent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </button>
          )}

          {/* Separator */}
          <div className="w-px h-6 bg-white/10 flex-shrink-0 mx-1" />

          {/* Date Range Filter — prominently placed */}
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            storageKey="logisticsDateRange"
            label="Date Range"
          />
        </div>
      )}

      {/* ===== Info Banner + Date Selector ===== */}
      {data?.length > 0 && (
        <div className="glass-card p-4 mb-6 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Re-upload
          </button>
          <div className="w-px h-5 bg-white/10 flex-shrink-0"></div>
          {/* Date Selector */}
          {availableDates?.length > 0 && (
            <>
              <div className="flex items-center gap-2 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-light">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <select
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  disabled={dateChanging}
                  className={`text-xs px-3 py-1.5 rounded-lg border outline-none transition-all duration-200 cursor-pointer ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 focus:border-electric/50'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 focus:border-electric/50'
                  } ${dateChanging ? 'opacity-50' : ''}`}
                >
                  {availableDates.map((d, i) => {
                    const label = typeof d === 'object' ? d.label : d;
                    const value = typeof d === 'object' ? d.value : d;
                    return (
                      <option key={i} value={value}>
                        {label}{i === 1 ? ' (2nd latest)' : i === 0 ? ' (latest)' : ''}
                      </option>
                    );
                  })}
                </select>
                {dateChanging && (
                  <div className="w-4 h-4 border-2 border-electric/30 border-t-electric rounded-full animate-spin" />
                )}
              </div>
              <div className="w-px h-5 bg-white/10 flex-shrink-0"></div>
            </>
          )}
          <div className="w-6 h-6 rounded-md bg-electric/10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-electric-light">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
            {hasComparison ? (
              <>Team sheet comparison active — rows are <span className="text-emerald font-semibold">highlighted green</span> for matches and <span className="text-rose-400 font-semibold">red</span> for mismatches.</>
            ) : activeFilter ? (
              <>Filtered by <span className="text-electric-light font-semibold">{FILTER_BUTTONS.find(f => f.key === activeFilter)?.label || activeFilter}</span> — showing {filteredData?.length || 0} of {data.length} records.</>
            ) : (
              <>Showing <span className="text-electric-light font-semibold">{filteredData?.length || 0}</span> records. Applied date filter: <span className="text-electric-light font-semibold">{describeDateRange(dateRange)}</span>. Upload the <span className="text-emerald-400 font-semibold">Team Sheet</span> to compare tickets.</>
            )}
          </p>
        </div>
      )}

      {/* ===== Data Table ===== */}
      <div ref={tableRef}>
        <LogisticsTable data={filteredData} loading={loading} onUploadClick={() => setShowUploadModal(true)} hasComparison={hasComparison} />
      </div>

      </> /* end of logistics tab conditional */
      )}

      {/* ===== Logistics Upload Modal ===== */}
      {showUploadModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div
            className="glass-card w-full max-w-md p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Upload Logistics File</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-electric bg-electric/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-electric/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-electric-light">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              </div>
              <p className="text-sm text-slate-300 mb-2">Drag & drop Logistics Excel file here</p>
              <p className="text-xs text-slate-500 mb-4">Supports .xlsx, .xls</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 rounded-xl bg-electric/15 text-electric-light text-sm font-medium hover:bg-electric/25 transition-all duration-200 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Browse Files'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </div>

            {uploadMsg && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                uploadMsg.type === 'success'
                  ? 'bg-emerald/10 text-emerald-light'
                  : 'bg-rose/10 text-rose-light'
              }`}>
                {uploadMsg.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Team Upload Modal ===== */}
      {showTeamUploadModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowTeamUploadModal(false)}>
          <div
            className="glass-card w-full max-w-md p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white">Upload Team Sheet</h2>
              </div>
              <button
                onClick={() => setShowTeamUploadModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-6 ml-12">
              Checks if ticket numbers from logistics sheet exist in the team sheet
            </p>

            <div
              onDragEnter={handleTeamDrag}
              onDragLeave={handleTeamDrag}
              onDragOver={handleTeamDrag}
              onDrop={handleTeamDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                teamDragActive
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-white/10 hover:border-emerald-500/30'
              }`}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <p className="text-sm text-slate-300 mb-2">Drag & drop Team Sheet Excel here</p>
              <p className="text-xs text-slate-500 mb-4">Supports .xlsx, .xls</p>
              <button
                onClick={() => teamFileInputRef.current?.click()}
                disabled={teamUploading}
                className="px-4 py-2 rounded-xl bg-emerald-500/15 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {teamUploading ? 'Comparing...' : 'Browse Files'}
              </button>
              <input
                ref={teamFileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleTeamFileUpload(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/50 inline-block"></span>
                Ticket found in team sheet
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500/30 border border-rose-500/50 inline-block"></span>
                Ticket not found
              </span>
            </div>

            {teamUploadMsg && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-medium ${
                teamUploadMsg.type === 'success'
                  ? 'bg-emerald/10 text-emerald-light'
                  : 'bg-rose/10 text-rose-light'
              }`}>
                {teamUploadMsg.text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
