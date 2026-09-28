import 'server-only';

import {Database as DataSource} from '@/lib/db';

export const str=(data:any,...keys:string[]):string=>{
 for(const key of keys)if(data?.[key]!=null&&String(data[key]).trim())return String(data[key]).trim();return '';
};
export const day=(value:any):string=>value instanceof Date?value.toISOString().slice(0,10):String(value||'').slice(0,10);

export class OperationsDatabase {
 constructor(readonly db:DataSource) {}
 async history(dataset:string):Promise<any[]> {return this.db.query('SELECT data,reference,work_date,source_sheet FROM operations_history WHERE dataset=$1 ORDER BY work_date DESC NULLS LAST,id DESC',[dataset]);}
 async inventory(serialNumbers?:string[],orderNumbers?:string[]) {
  // Current editable database entries override older imported reference inventories.
  const ontRows:any[]=await this.db.query("SELECT * FROM (SELECT serial_number,po_number,model,source_sheet,0 priority,updated_at FROM ont_inventory UNION ALL SELECT data->>'serial_number',data->>'po_number',data->>'model',category,1,updated_at FROM equipment_records WHERE kind='ont') inventory WHERE ($1::text[] IS NULL OR upper(trim(serial_number))=ANY($1)) ORDER BY priority,updated_at",[serialNumbers?.map(s=>s.trim().toUpperCase())??null]);
  const ont=new Map<string,{poNumber:string;assetDescription:string;sheetNames:string[]}>();
  for(const row of ontRows){const serial=str(row,'serial_number').toUpperCase();if(serial)ont.set(serial,{poNumber:str(row,'po_number'),assetDescription:str(row,'model'),sheetNames:[str(row,'source_sheet')]});}
  const cpeRows:any[]=await this.db.query("SELECT * FROM (SELECT order_number,serial_number FROM cpe_inventory UNION ALL SELECT data->>'order_number',data->>'serial_number' FROM equipment_records WHERE kind='cpe') inventory WHERE ($1::text[] IS NULL OR trim(order_number)=ANY($1))",[orderNumbers??null]);
  return {ont,cpeOrders:new Map<string,boolean>(cpeRows.filter(r=>r.order_number).map(r=>[String(r.order_number).trim(),true])),cpeSerials:new Set<string>(cpeRows.filter(r=>r.serial_number).map(r=>String(r.serial_number).trim().toUpperCase()))};
 }
 async delivery(projectId?:string) {
  const rows:any[]=await this.db.query(`SELECT o.*,to_jsonb(s) AS submission FROM orders o LEFT JOIN delivery_submissions s ON s.order_id=o.id AND s.status IN ('submitted','locked') WHERE ($1::uuid IS NULL OR o.project_id=$1) ORDER BY o.work_date DESC NULLS LAST,o.id`,[projectId??null]);
  return rows.map(o=>{const d=o.legacy_data||{},s=o.submission||{};return {date:day(o.work_date),team:str(o,'team'),exchange:str(o,'exchange'),orderNumber:str(o,'order_number'),contact:str(o,'contact'),lo:str(o,'lo'),serviceIdentifier:str(o,'service_identifier'),orderType:str(o,'order_type'),connectionType:str(o,'connection_type'),lineDescription1:str(d,'line description 1'),lineDescription2:str(d,'line description 2'),lineDescription3:str(d,'line description 3'),lineDescription4:str(d,'line description 4'),fttrType:str(o,'fttr_type'),actioned:str(o,'action'),nceSN:str(s,'nce_sn')||str(d,'nce sn'),mimsSN:str(s,'mims_sn')||str(d,'mims sn'),ap1SN:str(s,'ap1_sn')||str(d,'ap1','ap1 sn'),ap2SN:str(s,'ap2_sn')||str(d,'ap2','ap2 sn'),package:str(o,'package'),block:str(o,'block'),road:str(o,'road'),build:str(o,'building'),flat:str(o,'flat'),slot:str(o,'slot'),controller:str(d,'controller')};});
 }
 async assuranceAudit(projectId:string) {
  const rows:any[]=await this.db.query(`SELECT t.*,to_jsonb(s) submission FROM assurance_tickets t
   LEFT JOIN LATERAL (SELECT * FROM assurance_submissions WHERE ticket_id=t.id AND submitted_at IS NOT NULL
    AND status IN ('submitted','locked') ORDER BY (technician_id=t.technician_id) DESC NULLS LAST,submitted_at DESC,id DESC LIMIT 1) s ON true
   WHERE t.project_id=$1 ORDER BY t.work_date DESC NULLS LAST,t.id`,[projectId]);
  const records=rows.map(t=>{const f=t.spreadsheet_fields||{},d=t.legacy_data||{},s=t.submission||{};return {
   date:day(t.work_date),team:str(t,'team'),exchange:str(t,'exchange'),orderNumber:str(t,'ticket_number'),contact:str(t,'mobile'),lo:str(t,'lo_name'),serviceIdentifier:str(t,'circuit'),
   orderType:str(f,'wbs_type')||str(d,'wbs type','type'),connectionType:str(f,'wbs_connection_type')||str(d,'wbs connection type','connection type'),
   lineDescription1:str(t,'service_type'),lineDescription2:'',lineDescription3:'',lineDescription4:'',fttrType:'',
   actioned:['resolved','closed','delivered'].includes(str(t,'status').toLowerCase())?'Delivered':str(t,'status'),
   nceSN:str(f,'new_ont_sn')||str(d,'new sn no as per nce')||str(s,'new_cpe_sn'),mimsSN:str(s,'mims'),ap1SN:'',ap2SN:'',package:str(t,'package'),block:str(t,'block'),road:str(t,'road'),build:str(t,'building'),flat:str(t,'flat'),slot:'',controller:''};});
  const responses=rows.filter(t=>t.submission).map(t=>({timestamp:day(t.submission.submitted_at),teamName:str(t,'team'),orderNumber:str(t,'ticket_number'),
   fttrOrderType:str(t.submission,'response_order_type'),connectionType:str(t.submission,'response_connection_type'),packageName:str(t,'package'),ontSerialNumber:str(t.submission,'new_cpe_sn')}));
  return {records,responses};
 }
 async responses(projectId?:string,includeHistory=true) {
  const history=includeHistory?(await this.history('response')).reverse():[];
  const imported=history.map(r=>{const d=r.data;return {timestamp:day(r.work_date),teamName:str(d,'team name'),orderNumber:str(d,'order number','order no','order'),fttrOrderType:str(d,'fttr order type','order type'),packageName:str(d,'package name','package'),connectionType:str(d,'connection type'),ontSerialNumber:str(d,'ont serial number','fttr master ont serial number','serial number')}}).filter(r=>r.orderNumber);
  const live:any[]=await this.db.query(`SELECT o.order_number,s.response_order_type,o.package,s.response_connection_type,o.team,s.nce_sn,s.submitted_at FROM delivery_submissions s JOIN orders o ON o.id=s.order_id WHERE s.status IN ('submitted','locked') AND ($1::uuid IS NULL OR o.project_id=$1) ORDER BY s.submitted_at,s.id`,[projectId??null]);
  return [...imported,...live.map(r=>({timestamp:day(r.submitted_at),teamName:str(r,'team'),orderNumber:str(r,'order_number'),fttrOrderType:str(r,'response_order_type'),packageName:str(r,'package'),connectionType:str(r,'response_connection_type'),ontSerialNumber:str(r,'nce_sn')}))];
 }
}


export class OperationsDatabaseModule {}
