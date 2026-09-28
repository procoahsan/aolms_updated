import 'server-only';



export class AuditLog {
  
  id: string;

  
  user_id: string;

  
  table_name: string;

  
  record_id: string;

  
  action: 'insert' | 'update' | 'delete';

  
  old_values: Record<string, any>;

  
  new_values: Record<string, any>;

  
  created_at: Date;
}