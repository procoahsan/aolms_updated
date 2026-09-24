import { useState, useRef } from 'react';
import { useStaff } from '../hooks/useStaff';
import { uploadExcelFile } from '../api/staffApi';
import Header from '../components/layout/Header';
import SearchBar from '../components/ui/SearchBar';
import StatsCard from '../components/ui/StatsCard';
import ExpiryPieChart from '../components/ui/ExpiryPieChart';
import StaffFilters from '../components/staff/StaffFilters';
import StaffTable from '../components/staff/StaffTable';

export default function StaffDashboard() {
  const { staffData, stats, loading, error, filters, updateFilter, resetFilters, refresh } = useStaff();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const staffTableRef = useRef(null);

  const handleCardClick = (statusValue) => {
    // Reset all filters first, then set the status filter
    updateFilter('nationality', '');
    updateFilter('category', '');
    updateFilter('search', '');
    updateFilter('docExpiry', '');
    let exactStatus = statusValue;
    if (statusValue && stats?.statuses) {
      const match = stats.statuses.find(s => s.toLowerCase().includes(statusValue.toLowerCase()));
      if (match) exactStatus = match;
    }
    updateFilter('status', exactStatus);
    // Scroll to the staff table after a short delay to let the filter apply
    setTimeout(() => {
      staffTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleArcClick = (docExpiryValue) => {
    // Toggle the document expiry filter off if clicked again
    if (filters.docExpiry === docExpiryValue) {
      updateFilter('docExpiry', '');
      return;
    }
    updateFilter('nationality', '');
    updateFilter('category', '');
    updateFilter('search', '');
    updateFilter('status', '');
    updateFilter('docExpiry', docExpiryValue);
    setTimeout(() => {
      staffTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      setUploading(true);
      setUploadMsg(null);
      const result = await uploadExcelFile(file);
      setUploadMsg({ type: 'success', text: result.message });
      refresh();
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

  return (
    <div className="animate-fade-in">
      <Header onUploadClick={() => setShowUploadModal(true)} />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
          <StatsCard
            label="Total Staff"
            value={stats.total}
            color="electric"
            delay={0}
            onClick={() => handleCardClick('')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatsCard
            label="Active"
            value={stats.active}
            color="emerald"
            delay={100}
            onClick={() => handleCardClick('active')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
          />
          <StatsCard
            label="On Leave"
            value={stats.onLeave}
            color="amber"
            delay={200}
            onClick={() => handleCardClick('leave')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            }
          />
          <StatsCard
            label="Will Release"
            value={stats.willRelease}
            color="rose"
            delay={300}
            onClick={() => handleCardClick('release')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="17" y1="11" x2="23" y2="11" />
              </svg>
            }
          />
        </div>
      )}

      {/* Document Expiry Pie Chart */}
      {stats?.documentExpiry && (
        <div className="mb-8">
          <ExpiryPieChart 
            data={stats.documentExpiry} 
            onArcClick={handleArcClick}
            activeFilter={filters.docExpiry}
          />
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6">
        <SearchBar
          value={filters.search}
          onChange={(val) => updateFilter('search', val)}
        />
      </div>
      <StaffFilters filters={filters} onFilterChange={updateFilter} stats={stats} />

      {/* Error State */}
      {error && (
        <div className="glass-card p-6 mb-6 border-rose/30">
          <div className="flex items-center gap-3 text-rose-light">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p className="font-medium">Connection Error</p>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
              <p className="text-xs text-slate-500 mt-2">Make sure the backend is running on port 3001</p>
            </div>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div ref={staffTableRef}>
        <StaffTable data={staffData.data} loading={loading} />
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div
            className="glass-card w-full max-w-md p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Upload Excel File</h2>
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
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-light">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-sm text-slate-300 mb-2">Drag & drop your Excel file here</p>
              <p className="text-xs text-slate-500 mb-4">Supports .xlsx, .xls files</p>
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
    </div>
  );
}
