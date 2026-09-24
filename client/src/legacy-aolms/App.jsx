import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import StaffDashboard from './pages/StaffDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import ServiceDeliveryDashboard from './pages/ServiceDeliveryDashboard';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route index element={<StaffDashboard />} />
        <Route path="/logistics" element={<LogisticsDashboard />} />
        <Route path="/service-delivery" element={<ServiceDeliveryDashboard />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
