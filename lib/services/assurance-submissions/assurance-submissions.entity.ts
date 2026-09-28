import 'server-only';


export enum AssuranceSubmissionStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Locked = 'locked',
}


export class AssuranceSubmission {
  
  id: string;

  
  ticket_id: string;

  
  technician_id: string;

  
  status: AssuranceSubmissionStatus;

  
  last_saved_at: Date;

  
  submitted_at: Date;

  
  edit_deadline: Date;

  
  root_cause: string;

  
  resolution: string;

  
  resolution_description: string;

  
  mims: string;

  
  replacement_reason: string;

  
  replaced_cpe_model: string;

  
  replaced_cpe_sn: string;

  
  new_cpe_model: string;

  
  new_cpe_sn: string;

  
  ont_protection_box: string;

  
  saas_type: string;

  
  box_number: string;

  
  replacement: string;

  
  saas_non_saas: string;

  
  model: string;

  
  physical_verification: string;

  
  location: string;

  
  closed: boolean;

  
  remarks: string;


  
  version: number;

  
  last_mutation_id: string;

  
  created_at: Date;

  
  updated_at: Date;
}