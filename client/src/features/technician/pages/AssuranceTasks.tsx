import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, currentUserId, type AuditData } from '../../assurance/api';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { supabase } from '../../../main';

export default function AssuranceTasks({todo=false}:{todo?:boolean}){
 const [filter,setFilter]=useState<'all'|'completed'|'pending'>('all');
 const user=useQuery({queryKey:['session-user-id'],queryFn:currentUserId});
 const audit=useQuery({queryKey:['assurance-audit',user.data],enabled:!!user.data,queryFn:()=>api<AuditData>('/assurance-submissions/audit'),refetchInterval:30000});
 const delivery=useQuery({queryKey:['delivery-todo',user.data],enabled:todo&&!!user.data,queryFn:async()=>{
  const {data,error}=await supabase!.from('orders').select('id,order_number,exchange,work_date').eq('technician_id',user.data!).eq('action','Delivered').order('work_date',{ascending:false});if(error)throw error;
  const {data:submissions,error:se}=await supabase!.from('delivery_submissions').select('order_id,submitted_at').eq('technician_id',user.data!);if(se)throw se;
  return (data||[]).filter(o=>!submissions?.some(s=>s.order_id===o.id&&s.submitted_at));
 }});
 if(user.isPending||audit.isPending)return <p>Loading tasks...</p>;
 if(user.error||audit.error)return <p role="alert">{user.error?.message||audit.error?.message}</p>;
 const rows=(audit.data?.rows||[]).filter(r=>todo?r.active_assignment&&!r.completed:filter==='all'||(filter==='completed'?r.completed:!r.completed));
 return <div className="space-y-4"><div className="flex items-center justify-between"><h1 className="text-h2 font-semibold">{todo?'To-Do':'Service Assurance Audit'}</h1><Button variant="outline" onClick={()=>{audit.refetch();if(todo)delivery.refetch();}}>Refresh</Button></div>
 {!todo&&<div className="flex flex-wrap gap-3">{(['all','completed','pending'] as const).map(f=><Button key={f} variant={filter===f?'primary':'outline'} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f==='all'?'All':f==='completed'?`Completed: ${audit.data?.counts.completed||0}`:`To be completed: ${audit.data?.counts.pending||0}`}</Button>)}</div>}
 <Card padding="none" className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-neutral-100 dark:bg-neutral-800"><tr>{['Ticket / Circuit','Work date','Exchange / Service','Status','Assigned Technician','Completion','Submitted','Edit availability','Action'].map(h=><th className="whitespace-nowrap p-3" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t border-neutral-200 dark:border-neutral-700"><td className="p-3">{r.ticket_number}<div className="text-xs text-neutral-500">{r.circuit}</div></td><td className="p-3">{r.work_date?.slice(0,10)}</td><td className="p-3">{r.exchange}<div className="text-xs">{r.service_type}</div></td><td className="p-3">{r.status}{!r.active_assignment&&<div className="text-xs text-neutral-500">Historical assignment</div>}</td><td className="p-3">{r.technician_name||'Unassigned'}</td><td className="p-3">{r.completed?'Completed':'To be completed'}</td><td className="p-3">{r.submitted_at?new Date(r.submitted_at).toLocaleString():'—'}</td><td className="p-3">{!r.active_assignment?'View only':r.can_edit?(r.completed?'Edit available':'Todo'): 'Edit expired'}</td><td className="p-3"><Link className="text-primary-600 underline" to={`/technician/assurance-form/${r.id}`}>{r.can_edit?'Edit':'View'}</Link></td></tr>)}{!rows.length&&<tr><td className="p-8" colSpan={9}>No matching Service Assurance tasks.</td></tr>}</tbody></table></Card>
 {!todo&&<p className="text-xs text-neutral-500">Completed forms appear first. Historical assignments are preserved for viewing; the displayed Status and Team reflect the latest Controller record.</p>}
 {todo&&<Card title="Service Delivery">{delivery.error&&<p role="alert">{delivery.error.message}</p>}{delivery.isPending?<p>Loading delivery tasks...</p>:delivery.data?.length?delivery.data.map(o=><div key={o.id} className="flex justify-between border-b p-3"><span>{o.order_number} · {o.exchange}</span><Link className="text-primary-600 underline" to={`/technician/delivery-form/${o.id}`}>Open form</Link></div>):<p>No pending delivery tasks.</p>}</Card>}
 </div>;
}
