import 'server-only';



export class Attachment {
  
  id: string;

  
  submission_id: string;

  
  submission_type: 'delivery_submission' | 'assurance_submission';

  
  file_name: string;

  
  storage_path: string;

  
  file_type: string;

  
  file_size: number;

  
  uploaded_by: string;

  
  created_at: Date;
}