import {ProtectedRoute} from '@/components/portal/auth/components/ProtectedRoute';
import TechnicianLayout from '@/components/portal/features/technician/layout/TechnicianLayout';
export default function Layout({children}:{children:React.ReactNode}){return <ProtectedRoute><TechnicianLayout>{children}</TechnicianLayout></ProtectedRoute>;}
