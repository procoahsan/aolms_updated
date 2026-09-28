import { useState, useEffect, useCallback } from 'react';
import { fetchStaff, fetchStaffStats } from '../api/staffApi';

export function useStaff() {
  const [staffData, setStaffData] = useState({ data: [], total: 0, page: 1, limit: 100 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    nationality: '',
    status: '',
    category: '',
    docExpiry: '',
    sortBy: '',
    sortOrder: 'asc',
  });

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStaff(filters);
      setStaffData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchStaffStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      nationality: '',
      status: '',
      category: '',
      docExpiry: '',
      sortBy: '',
      sortOrder: 'asc',
    });
  };

  const refresh = () => {
    loadStaff();
    loadStats();
  };

  return {
    staffData,
    stats,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    refresh,
  };
}
