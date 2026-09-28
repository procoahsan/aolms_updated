import 'server-only';


export enum AssignmentStatus {
  Pending = 'pending',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}


export class OrderAssignment {
  
  id: string;

  
  order_id: string;

  
  technician_id: string;

  
  assigned_by: string;

  
  assignment_status: AssignmentStatus;

  
  assigned_at: Date;

  
  completed_at: Date;

  
  created_at: Date;

  
  updated_at: Date;
}