import { randomId } from '../../lib/uuid';
import { supabase } from '@/lib/supabase-browser';

export interface Field { key:string; label:string; excelColumn:string; storage:string; type:string; options?:string[] }
export interface Ticket { id:string; project_id:string; version:number; ticket_number:string; technician_id:string|null; controller_id:string; status:string; spreadsheet_fields:Record<string,string|null>; [key:string]:unknown }
export interface Draft { id:string; project_id:string; base_version:number|null; mutation_id:string; values:Record<string,string> }
export interface AuditRow { id:string; submission_technician_id?:string; ticket_number:string; work_date:string; circuit:string; exchange:string; service_type:string; status:string; technician_name:string; active_assignment:boolean; completed:boolean; submitted_at:string|null; edit_deadline:string|null; can_edit:boolean }
export interface AuditData { rows:AuditRow[]; counts:{completed:number;pending:number}; server_time:string }
export interface Submission { id:string;version:number;technician_id:string;status:string;submitted_at:string|null;edit_deadline:string|null;last_mutation_id:string;[key:string]:unknown }
export interface FormDataResponse { ticket:Ticket;submission:Submission|null;can_edit:boolean;server_time:string; options:Record<string,string[]>; received_at:number }
export async function api<T>(path:string, init:RequestInit={}):Promise<T> {
  const {data}=await supabase!.auth.getSession();
  if(!data.session) throw new Error('Please sign in again');
  const base=('/api').replace(/\/$/,'');
  const response=await fetch(base+path,{...init,headers:{'Content-Type':'application/json',Authorization:`Bearer ${data.session.access_token}`,...init.headers}});
  const body=await response.json().catch(():null=>null);
  if(!response.ok) throw new Error(Array.isArray(body?.message)?body.message.join(', '):body?.message||`Request failed (${response.status})`);
  return body;
}
export async function currentUserId(){ const {data}=await supabase!.auth.getUser();if(!data.user)throw new Error('Please sign in');return data.user.id; }
export function toInput(value:unknown,type:string){
  if(value==null)return '';
  if(type==='date')return String(value).slice(0,10);
  if(type==='datetime-local'){const date=new Date(String(value));return Number.isFinite(date.getTime())?new Date(date.getTime()+3*3600000).toISOString().slice(0,19):String(value);}
  return String(value);
}
export function ticketDraft(ticket:Ticket,fields:Field[]):Draft {
  return {id:ticket.id,project_id:ticket.project_id,base_version:ticket.version,mutation_id:randomId(),values:Object.fromEntries(fields.map(f=>[f.key,toInput(f.storage.startsWith('spreadsheet_fields.')?ticket.spreadsheet_fields?.[f.key]:ticket[f.key],f.type)]))};
}
export function savePayload(draft:Draft,fields:Field[]){
  const values={...draft.values};
  for(const f of fields)if(f.type==='datetime-local' && values[f.key])values[f.key]=new Date(values[f.key]+'+03:00').toISOString();
  return { ...values,id:draft.id,project_id:draft.project_id,base_version:draft.base_version,mutation_id:draft.mutation_id };
}
