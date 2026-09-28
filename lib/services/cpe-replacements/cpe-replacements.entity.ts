import 'server-only';



export class CpeReplacement {
  
  id: string;

  
  submission_id: string;

  
  submission_type: 'delivery_submission' | 'assurance_submission';

  
  old_cpe_model: string;

  
  old_cpe_serial: string;

  
  new_cpe_model: string;

  
  new_cpe_serial: string;

  
  reason: string;

  
  created_at: Date;
}