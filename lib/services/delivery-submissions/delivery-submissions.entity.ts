import 'server-only';


export enum DeliveryStatus {
  Draft = 'draft',
  Submitted = 'submitted',
  Locked = 'locked',
}



export class DeliverySubmission {
  
  response_order_type: string;

  
  response_connection_type: string;

  
  id: string;

  
  order_id: string;

  
  technician_id: string;

  
  status: DeliveryStatus;

  
  last_saved_at: Date;

  
  submitted_at: Date;

  
  edit_deadline: Date;

  
  actioned: string;

  
  sub_root_cause: string;

  
  item_category: string;

  
  ont_protection: string;

  
  internal_wiring: string;

  
  actual_actioned_item: string;

  
  actual_actioned_sub_item: string;

  
  cable_type: string;

  
  cable_length: number;

  
  conduit_clearance: string;

  
  conduit_pipe: string;

  
  pvc_trunk: string;

  
  total_conduit: number;

  
  mims_sn: string;

  
  nce_sn: string;

  
  ap1_sn: string;

  
  ap2_sn: string;

  
  ap3_sn: string;

  
  ap4_sn: string;

  
  retrieved_cpe: string;

  
  remarks: string;

  
  created_at: Date;

  
  updated_at: Date;
}