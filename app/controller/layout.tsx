import {ProtectedRoute} from '@/components/portal/auth/components/ProtectedRoute';
import ControllerLayout from '@/components/portal/features/controller/layout/ControllerLayout';
export default function Layout({children}:{children:React.ReactNode}){return <ProtectedRoute><ControllerLayout>{children}</ControllerLayout></ProtectedRoute>;}
