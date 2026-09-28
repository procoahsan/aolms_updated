'use client';
import { randomId } from '../../../lib/uuid';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ticketDraft, savePayload, type Draft, type Field, type Ticket } from '../../assurance/api';
import { hasConflict, readDraft, writeDraft } from '../../assurance/drafts';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Modal } from '../../../components/Modal';

export default function AssuranceSpreadsheet({projectId,userId}:{projectId:string;userId:string}){
 const key=`aolms:assurance:v1:${userId}:${projectId}`;
 const [error,setError]=useState('');const [message,setMessage]=useState('');
 const [drafts,setDrafts]=useState<Record<string,Draft>>(()=>{try{return readDraft(key,{});}catch{return {};}});
 const storageSnapshot=useRef(localStorage.getItem(key));
 const [saving,setSaving]=useState(false);const [page,setPage]=useState(0);const [review,setReview]=useState<string|null>(null);
 const queryClient=useQueryClient();
 const meta=useQuery({queryKey:['assurance-metadata',userId],queryFn:()=>api<{fields:Field[];technicians:Array<{id:string;full_name:string}>}>('/assurance-tickets/metadata')});
 const records=useQuery({queryKey:['assurance-tickets',userId,projectId],queryFn:()=>api<Ticket[]>(`/assurance-tickets?project_id=${projectId}`)});
 const fields=meta.data?.fields||[];const saved=records.data||[];
 const byId=new Map(saved.map(t=>[t.id,t]));
 const ids=[...Object.keys(drafts).filter(id=>!byId.has(id)),...saved.map(t=>t.id)];
 const visible=ids.slice(page*25,(page+1)*25);
 useEffect(()=>{const fn=(event:StorageEvent)=>{if(event.key===key)setError('This draft changed in another tab. Reload this page before editing to avoid overwriting it.');};window.addEventListener('storage',fn);return()=>window.removeEventListener('storage',fn);},[key]);
 function persist(next:Record<string,Draft>){
  if(localStorage.getItem(key)!==storageSnapshot.current){setError('Draft changed in another tab. Reload before editing.');return false;}
  try{writeDraft(key,next);storageSnapshot.current=localStorage.getItem(key);setDrafts(next);setError('');return true;}catch{setError('Browser storage is unavailable or full. Keep this page open and export your draft.');setDrafts(next);return false;}
 }
 function edit(id:string,field:string,value:string){const draft=drafts[id]||ticketDraft(byId.get(id)!,fields);persist({...drafts,[id]:{...draft,mutation_id:randomId(),values:{...draft.values,[field]:value}}});setMessage('');}
 function add(){const id=randomId();persist({...drafts,[id]:{id,project_id:projectId,base_version:null,mutation_id:randomId(),values:{work_date:new Date().toISOString().slice(0,10),status:'Open',technician_id:''}}});setPage(0);}
 async function save(){
  if(localStorage.getItem(key)!==storageSnapshot.current){setError('Draft changed in another tab. Reload before saving.');return;}
  setSaving(true);setError('');setMessage('');
  try{
   const batch=Object.values(drafts).slice(0,100);
   if(batch.some(d=>hasConflict(d.base_version,byId.get(d.id)?.version)))throw new Error('A row changed on the server. Use Review conflict before saving.');
   const result=await api<Ticket[]>('/assurance-tickets/batch',{method:'POST',body:JSON.stringify({rows:batch.map(d=>savePayload(d,fields))})});
   const next={...drafts};for(const row of result)if(next[row.id]?.mutation_id===row.last_mutation_id)delete next[row.id];
   persist(next);
   await queryClient.invalidateQueries({queryKey:['assurance-tickets']});
   setMessage(`${result.length} rows saved to database.`);
  }catch(e){setError((e as Error).message);await records.refetch();}finally{setSaving(false);}
 }
 function navigateCell(e:React.KeyboardEvent<HTMLElement>,row:number,col:number){
  if(!['Enter','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;
  if(e.currentTarget.tagName==='SELECT'&&!e.altKey&&e.key!=='Enter')return;
  if(['ArrowLeft','ArrowRight'].includes(e.key)&&!e.altKey)return;
  e.preventDefault();const dr=e.key==='ArrowUp'||(e.key==='Enter'&&e.shiftKey)?-1:e.key==='ArrowDown'||e.key==='Enter'?1:0;
  const dc=e.key==='ArrowLeft'?-1:e.key==='ArrowRight'?1:0;
  document.querySelector<HTMLElement>(`[data-cell="${row+dr}:${col+dc}"]`)?.focus();
 }
 function exportDraft(){const url=URL.createObjectURL(new Blob([JSON.stringify(drafts,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='assurance-draft.json';a.click();URL.revokeObjectURL(url);}
 const reviewing=review?drafts[review]:null;const latest=review?byId.get(review):null;
 if(meta.isPending||records.isPending)return <p>Loading Service Delivery...</p>;
 if(meta.error||records.error)return <p role="alert">{meta.error?.message||records.error?.message}</p>;
 return <div className="space-y-3">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-h4 font-semibold">Service Delivery</h2><p className="text-sm text-neutral-500">{saved.length} records · {Object.keys(drafts).length} locally cached drafts · Dates/times: Bahrain</p></div>
 <div className="flex flex-wrap gap-2"><Button onClick={add} disabled={saving}>Add row</Button><Button onClick={save} disabled={saving||!Object.keys(drafts).length} isLoading={saving}>Save {Math.min(100,Object.keys(drafts).length)} rows</Button><Button variant="outline" onClick={()=>records.refetch()} disabled={saving}>Refresh</Button><Button variant="ghost" onClick={exportDraft}>Export draft</Button></div></div>
 <p className="text-xs text-neutral-500">Edits stay on this browser until you save. Tab moves across cells; Enter / Up / Down moves between rows; Alt + Left / Right moves between columns. Only Resolved rows with a Team become technician Todo tasks.</p>
 {!meta.data?.technicians.length&&<p className="text-sm text-warning-700">No active Technicians are configured. An Admin must add one before a task can be assigned.</p>}
 {error&&<p role="alert" className="text-danger-600">{error}</p>}{message&&<p role="status" className="text-success-700">{message}</p>}
 <Card padding="none" className="overflow-hidden"><div className="max-h-[65vh] overflow-auto"><table className="border-collapse text-sm" aria-label="Service Delivery spreadsheet"><thead className="sticky top-0 z-20 bg-neutral-100 dark:bg-neutral-800"><tr><th className="sticky left-0 z-30 min-w-44 bg-neutral-100 p-2 dark:bg-neutral-800">Row</th>{fields.map(f=><th key={f.key} className="min-w-48 border border-neutral-200 p-2 text-left dark:border-neutral-700"><span className="text-xs text-neutral-400">{f.excelColumn} </span>{f.label}</th>)}</tr></thead><tbody>
 {visible.map((id,rowIndex)=>{const record=byId.get(id);const draft=drafts[id];const view=draft||ticketDraft(record!,fields);const conflict=!!draft&&hasConflict(draft.base_version,record?.version);return <tr key={id}><td className="sticky left-0 z-10 border bg-white p-2 dark:bg-neutral-900"><span>{page*25+rowIndex+1} · {draft?'Draft':'Saved'}</span>{conflict?<button className="block text-danger-600 underline" onClick={()=>setReview(id)}>Review conflict</button>:draft&&<button disabled={saving} className="block text-xs underline" onClick={()=>{if(window.confirm('Discard this local draft?')){const next={...drafts};delete next[id];persist(next);}}}>Discard draft</button>}</td>
 {fields.map((f,colIndex)=>{const value=view.values[f.key]||'';const cls='w-full min-w-48 border-0 bg-transparent px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500';const common={className:cls,'data-cell':`${rowIndex}:${colIndex}`,'aria-label':`${f.label}, row ${page*25+rowIndex+1}`,disabled:saving,onKeyDown:(e:React.KeyboardEvent<HTMLElement>)=>navigateCell(e,rowIndex,colIndex)};
 let input;
 if(f.type==='controller')input=<span className="block px-2">{String(record?.controller_name||'You')}</span>;
 else if(f.type==='computed'){const start=Date.parse(view.values.creation_datetime),end=Date.parse(view.values.close_datetime);input=<span className="block px-2">{Number.isFinite(start)&&Number.isFinite(end)?`${((end-start)/3600000).toFixed(2)} h`:''}</span>;}
 else if(f.type==='technician'||f.type==='select'){const options=f.type==='technician'?meta.data!.technicians.map(t=>({value:t.id,label:t.full_name})):(f.options||[]).map(v=>({value:v,label:v}));input=<select {...common} value={value} onChange={e=>edit(id,f.key,e.target.value)}><option value="">{f.type==='technician'?'Unassigned':'Select...'}</option>{value&&!options.some(o=>o.value===value)&&<option value={value}>{value} (previous value)</option>}{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>;}
 else input=<input {...common} type={f.type==='text'?'text':f.type} step={f.type==='datetime-local'?1:undefined} value={value} onChange={e=>edit(id,f.key,e.target.value)}/>;
 return <td key={f.key} className={`border border-neutral-200 dark:border-neutral-700 ${draft?'bg-warning-50/40 dark:bg-warning-950/10':''}`}>{input}</td>;})}</tr>;})}
 {!ids.length&&<tr><td colSpan={fields.length+1} className="p-8">No records yet. Add a row to begin.</td></tr>}
 </tbody></table></div></Card>
 <div className="flex gap-3"><Button variant="outline" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous</Button><span>Page {page+1} of {Math.max(1,Math.ceil(ids.length/25))}</span><Button variant="outline" disabled={(page+1)*25>=ids.length} onClick={()=>setPage(p=>p+1)}>Next</Button></div>
 <Modal isOpen={!!reviewing} onClose={()=>setReview(null)} title="Review newer database values" size="xl">
 <p className="mb-3 text-sm">Your draft has not overwritten the database. Compare the fields before choosing which version to keep.</p>
 {reviewing&&latest?<><div className="max-h-80 overflow-auto"><table className="w-full text-sm"><thead><tr><th>Field</th><th>Your draft</th><th>Database</th></tr></thead><tbody>{fields.filter(f=>reviewing.values[f.key]!==ticketDraft(latest,fields).values[f.key]).map(f=><tr key={f.key}><td>{f.label}</td><td className="p-2">{reviewing.values[f.key]}</td><td className="p-2">{ticketDraft(latest,fields).values[f.key]}</td></tr>)}</tbody></table></div><div className="mt-4 flex gap-2"><Button onClick={()=>{persist({...drafts,[reviewing.id]:{...reviewing,base_version:latest.version,mutation_id:randomId()}});setReview(null);}}>Keep reviewed draft for next save</Button><Button variant="outline" onClick={()=>{const next={...drafts};delete next[reviewing.id];persist(next);setReview(null);}}>Use database version</Button></div></>:<p>This record is no longer available. Export the draft and ask an administrator to review it.</p>}
 </Modal>
 </div>;
}
