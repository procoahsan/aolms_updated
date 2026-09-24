import { createContext, useContext, useState, useMemo } from 'react';

const LogisticsContext = createContext(null);

export function LogisticsProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [ontCheckData, setOntCheckData] = useState(null);
  const [activeTab, setActiveTab] = useState('logistics'); // 'logistics' | 'ontCheck'

  const value = useMemo(() => ({
    data,
    setData,
    loading,
    setLoading,
    availableDates,
    setAvailableDates,
    selectedDate,
    setSelectedDate,
    ontCheckData,
    setOntCheckData,
    activeTab,
    setActiveTab,
  }), [data, loading, availableDates, selectedDate, ontCheckData, activeTab]);

  return (
    <LogisticsContext.Provider value={value}>
      {children}
    </LogisticsContext.Provider>
  );
}

export function useLogistics() {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
}
