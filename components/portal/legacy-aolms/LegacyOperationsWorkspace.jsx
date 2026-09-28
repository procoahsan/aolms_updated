'use client';
import { useState } from 'react';
import './operations-portal.css';
import { LogisticsProvider } from './contexts/LogisticsContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import LogisticsDashboard from './pages/LogisticsDashboard.jsx';
import ServiceDeliveryDashboard from './pages/ServiceDeliveryDashboard.jsx';

export default function LegacyOperationsWorkspace({ role = 'admin' }) {
  const tabs = role === 'admin'
    ? [['staff', 'Staff'], ['logistics', 'Logistics'], ['delivery', 'Service assurance']]
    : [['logistics', 'Logistics'], ['delivery', 'Service assurance']];
  const [activeTab, setActiveTab] = useState(tabs[0][0]);

  return (
    <ThemeProvider>
      <LogisticsProvider>
        <section className="legacy-operations-space">
          <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-4">
            {tabs.map(([id, label]) => (
              <button key={id} type="button" onClick={() => setActiveTab(id)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeTab === id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
          {activeTab === 'staff' && role === 'admin' && <StaffDashboard />}
          {activeTab === 'logistics' && <LogisticsDashboard />}
          {activeTab === 'delivery' && <ServiceDeliveryDashboard />}
        </section>
      </LogisticsProvider>
    </ThemeProvider>
  );
}
