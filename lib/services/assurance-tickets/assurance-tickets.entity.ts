import 'server-only';



export class AssuranceTicket {
  
  id: string;

  
  project_id: string;

  
  ticket_number: string;

  
  work_date: Date;

  
  team: string;

  
  controller_id: string;

  
  package: string;

  
  assurance_program: string;

  
  exchange: string;

  
  block: string;

  
  road: string;

  
  building: string;

  
  flat: string;

  
  fault_description_from_lo: string;

  
  mobile: string;

  
  customer_description: string;

  
  service_type: string;

  
  lo_name: string;

  
  creation_datetime: Date;

  
  assigned_datetime: Date;

  
  close_datetime: Date;

  
  sla_from_creation: number;

  
  kpi_status: string;

  
  reason_if_exceeded: string;

  
  circuit: string;

  
  status: string; // e.g., open, in_progress, resolved, closed

  
  technician_id: string;


  
  spreadsheet_fields: Record<string, unknown>;

  
  version: number;

  
  last_mutation_id: string;

  
  created_at: Date;

  
  updated_at: Date;
}