'use client';
export default function StaffFilters({ filters, onFilterChange, stats }) {
  const nationalities = stats?.nationalities || [];
  const categories = stats?.categories || [];
  const statuses = stats?.statuses || [];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6" id="staff-filters">
      {/* Nationality Filter */}
      <select
        id="filter-nationality"
        value={filters.nationality}
        onChange={(e) => onFilterChange('nationality', e.target.value)}
        className="px-3 py-2 rounded-lg bg-navy-800/80 border border-white/5 text-slate-300 text-sm focus:outline-none focus:border-electric/40 transition-all cursor-pointer appearance-none pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        <option value="">All Nationalities</option>
        {nationalities.filter(n => n && n !== 'NEED TO FILL').map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>

      {/* Category Filter */}
      <select
        id="filter-category"
        value={filters.category}
        onChange={(e) => onFilterChange('category', e.target.value)}
        className="px-3 py-2 rounded-lg bg-navy-800/80 border border-white/5 text-slate-300 text-sm focus:outline-none focus:border-electric/40 transition-all cursor-pointer appearance-none pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        <option value="">All Categories</option>
        {categories.filter(Boolean).map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        id="filter-status"
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
        className="px-3 py-2 rounded-lg bg-navy-800/80 border border-white/5 text-slate-300 text-sm focus:outline-none focus:border-electric/40 transition-all cursor-pointer appearance-none pr-8"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        <option value="">All Statuses</option>
        {statuses.filter(Boolean).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Reset button */}
      {(filters.nationality || filters.category || filters.status || filters.docExpiry) && (
        <button
          onClick={() => {
            onFilterChange('nationality', '');
            onFilterChange('category', '');
            onFilterChange('status', '');
            onFilterChange('docExpiry', '');
          }}
          className="px-3 py-2 rounded-lg bg-rose/10 text-rose-light text-sm font-medium hover:bg-rose/20 transition-all duration-200"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
