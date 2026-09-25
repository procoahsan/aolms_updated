import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider } from './app/theme/theme-context';
import Login from './auth/pages/Login';
import AdminLayout from './features/admin/layout/AdminLayout';
import ControllerLayout from './features/controller/layout/ControllerLayout';
import TechnicianLayout from './features/technician/layout/TechnicianLayout';
import { ProtectedRoute } from './auth/components/ProtectedRoute';
import AdminDashboard from './features/admin/pages/Dashboard';
import Profiles from './features/admin/pages/Profiles';
import Projects from './features/admin/pages/Projects';
import Profile from './features/admin/pages/Profile';
import OperationsData from './features/admin/pages/OperationsData';
import ControllerProjects from './features/controller/pages/Projects';
import AssuranceTasks from './features/technician/pages/AssuranceTasks';
import AssuranceForm from './features/technician/components/AssuranceForm';
import TechnicianDeliveryForm from './features/technician/components/DeliveryForm';
import OperationsWorkspace from './features/operations/OperationsWorkspace';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
              <Route path="orders" element={<Navigate to="../projects" replace />} />
              <Route path="assurance-tickets" element={<Navigate to="../projects" replace />} />
              <Route path="legacy-operations" element={<OperationsWorkspace role="controller" />} />
            </Route>

            <Route path="/technician/*" element={<TechnicianLayout />}>
              <Route index element={<Navigate to="todo" replace />} />
              <Route path="dashboard" element={<Navigate to="../todo" replace />} />
              <Route path="todo" element={<AssuranceTasks todo />} />
              <Route path="audit" element={<AssuranceTasks />} />
              <Route path="history" element={<Navigate to="../audit" replace />} />
              <Route path="assurance-form/:ticketId" element={<AssuranceForm />} />
              <Route path="delivery-form/:orderId" element={<TechnicianDeliveryForm />} />
              <Route path="legacy-operations" element={<Navigate to="../todo" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
