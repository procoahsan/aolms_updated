import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './app/theme/theme-context';
import Login from './auth/pages/Login';
import AdminLayout from './features/admin/layout/AdminLayout';
import ControllerLayout from './features/controller/layout/ControllerLayout';
import TechnicianLayout from './features/technician/layout/TechnicianLayout';
import { ProtectedRoute } from './auth/components/ProtectedRoute';
const AdminDashboard = lazy(() => import('./features/admin/pages/Dashboard'));
const Profiles = lazy(() => import('./features/admin/pages/Profiles'));
const Projects = lazy(() => import('./features/admin/pages/Projects'));
const Profile = lazy(() => import('./features/admin/pages/Profile'));
const OperationsData = lazy(() => import('./features/admin/pages/OperationsData'));
const ControllerProjects = lazy(() => import('./features/controller/pages/Projects'));
const EquipmentDatabase = lazy(() => import('./features/controller/pages/EquipmentDatabase'));
const AssuranceTasks = lazy(() => import('./features/technician/pages/AssuranceTasks'));
const AssuranceForm = lazy(() => import('./features/technician/components/AssuranceForm'));
const TechnicianDeliveryForm = lazy(() => import('./features/technician/components/DeliveryForm'));
const OperationsWorkspace = lazy(() => import('./features/operations/OperationsWorkspace'));

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<div role="status" className="p-6">Loading page…</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            element={<ProtectedRoute><Outlet /></ProtectedRoute>}
          >
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="profiles" element={<Profiles />} />
              <Route path="projects" element={<Projects />} />
              <Route path="profile/me" element={<Profile />} />
              <Route path="operations-data" element={<OperationsData />} />
              <Route path="legacy-operations" element={<OperationsWorkspace role="admin" />} />
            </Route>

            <Route path="/controller/*" element={<ControllerLayout />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="dashboard" element={<p>Controller Dashboard is not available yet.</p>} />
              <Route path="projects" element={<ControllerProjects />} />
              <Route path="audit" element={<AssuranceTasks audit />} />
              <Route path="ont-db" element={<EquipmentDatabase kind="ont" />} />
              <Route path="cpe-db" element={<EquipmentDatabase kind="cpe" />} />
              <Route path="orders" element={<Navigate to="../projects" replace />} />
              <Route path="assurance-tickets" element={<Navigate to="../projects" replace />} />
              <Route path="legacy-operations" element={<OperationsWorkspace role="controller" />} />
            </Route>

            <Route path="/technician/*" element={<TechnicianLayout />}>
              <Route index element={<Navigate to="todo" replace />} />
              <Route path="dashboard" element={<Navigate to="../todo" replace />} />
              <Route path="todo" element={<AssuranceTasks todo />} />
              <Route path="submitted" element={<AssuranceTasks />} />
              <Route path="audit" element={<Navigate to="../submitted" replace />} />
              <Route path="history" element={<Navigate to="../submitted" replace />} />
              <Route path="settings" element={<Navigate to="../todo" replace />} />
              <Route path="assurance-form/:ticketId" element={<AssuranceForm />} />
              <Route path="delivery-form/:orderId" element={<TechnicianDeliveryForm />} />
              <Route path="legacy-operations" element={<Navigate to="../todo" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
