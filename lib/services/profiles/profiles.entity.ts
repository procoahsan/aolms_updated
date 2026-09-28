import 'server-only';



export class Profile {
  
  id: string;

  
  employee_code: string | null;

  
  full_name: string;

  
  email: string;

  
  role: 'admin' | 'controller' | 'technician';

  
  is_active: boolean;

  
  created_at: Date;

  
  updated_at: Date;
}
